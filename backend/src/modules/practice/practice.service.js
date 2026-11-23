const { isDeepStrictEqual } = require("node:util");
const { validarPrograma, comLimite, modoExecucao } = require("../execution/execution.service");
const { executarCasosPython } = require("../execution/execution.grading");
const repository = require("./practice.repository");
const usersRepository = require("../users/users.repository");
const AppError = require("../../shared/errors/AppError");
const { validarIdPositivo } = require("../../shared/validation/ids");

async function usuarioPorUid(firebaseUid) {
    const usuario = await usersRepository.buscarPorFirebaseUid(firebaseUid);
    if (!usuario) {
        throw new AppError(
            404,
            "PERFIL_NAO_ENCONTRADO",
            "Perfil não encontrado. Sincronize seu perfil antes de registrar a prática.",
        );
    }
    return usuario;
}

async function listarAulasConcluidas(firebaseUid, cursoId) {
    const usuario = await usuarioPorUid(firebaseUid);
    return repository.listarAulasComExerciciosAprovados(usuario.id, cursoId);
}

async function verificarConclusao(firebaseUid, aulaId) {
    const idAula = validarIdPositivo(aulaId, "ID da aula");
    const usuario = await usuarioPorUid(firebaseUid);
    const exercicio = await repository.buscarExercicioPorAula(idAula);
    if (!exercicio) return true;
    return repository.possuiConclusaoAprovada(usuario.id, idAula);
}

async function registrarTentativa(firebaseUid, aulaId, dados) {
    const idAula = validarIdPositivo(aulaId, "ID da aula");
    const usuario = await usuarioPorUid(firebaseUid);
    const exercicio = await repository.buscarExercicioPorAula(idAula);
    if (!exercicio) {
        throw new AppError(404, "EXERCICIO_NAO_ENCONTRADO", "Esta aula não possui prática interativa configurada.");
    }

    const avaliador = typeof exercicio.avaliador_json === "string"
        ? JSON.parse(exercicio.avaliador_json)
        : exercicio.avaliador_json;
    const totalCasos = avaliador?.casos?.length;
    if (!totalCasos || Number(exercicio.id) !== dados?.exercicioId) {
        throw new AppError(400, "RESULTADO_DE_EXERCICIO_INVALIDO", "Os resultados não correspondem aos casos desta prática. Recarregue a aula e tente novamente.");
    }

    const modo = modoExecucao("python");
    let resultados;
    if (modo === "navegador") {
        resultados = dados.resultados;
    } else {
        const { codigo } = validarPrograma({ linguagem: "python", codigo: dados?.codigo });
        resultados = await comLimite(firebaseUid, () => executarCasosPython(codigo, avaliador));
    }
    if (!Array.isArray(resultados) || resultados.length !== totalCasos) {
        throw new AppError(400, "RESULTADO_DE_EXERCICIO_INVALIDO", "Execute o código novamente para verificar todos os casos.");
    }

    const compararSaida = avaliador.tipo === "saida";
    const casos = resultados.map((resultado, indice) => {
        const caso = avaliador.casos[indice];
        const esperado = compararSaida ? caso.saida_esperada : caso.resultado_esperado;
        if (typeof resultado?.erro === "string" && resultado.erro && resultado.erro.length <= 4000) {
            return { correto: false, erro: resultado.erro };
        }
        if (!resultado || !Object.hasOwn(resultado, "valor")
            || JSON.stringify(resultado.valor).length > 12000
            || (compararSaida && typeof resultado.valor !== "string")) {
            throw new AppError(400, "RESULTADO_DE_EXERCICIO_INVALIDO", "O editor enviou um resultado inválido. Execute o código novamente.");
        }
        const valor = compararSaida ? resultado.valor.replace(/\r\n/g, "\n").trimEnd() : resultado.valor;
        const correto = compararSaida ? valor === esperado.trimEnd() : isDeepStrictEqual(valor, esperado);
        return correto ? { correto, valor } : { correto, valor, esperado };
    });
    const acertos = casos.filter((caso) => caso.correto).length;
    const aprovado = acertos === totalCasos;

    await repository.registrarTentativa({
        usuarioId: usuario.id,
        exercicioId: Number(exercicio.id),
        totalCasos,
        acertos,
        aprovado,
    });
    return { aulaId: idAula, aprovado, acertos, totalCasos, casos };
}

module.exports = {
    listarAulasConcluidas,
    verificarConclusao,
    registrarTentativa,
    reiniciarPorCurso: repository.reiniciarPorCurso,
};
