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

function quantidadeDeCasos(avaliador) {
    if (typeof avaliador === "string") {
        try {
            avaliador = JSON.parse(avaliador);
        } catch {
            return 0;
        }
    }
    return Array.isArray(avaliador?.casos) ? avaliador.casos.length : 0;
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

    const totalCasosConfigurados = quantidadeDeCasos(exercicio.avaliador_json);
    const totalCasos = Number(dados?.totalCasos);
    const acertos = Number(dados?.acertos);
    const aprovado = dados?.aprovado;
    if (!Number.isInteger(totalCasos) || totalCasos !== totalCasosConfigurados
        || !Number.isInteger(acertos) || acertos < 0 || acertos > totalCasos
        || typeof aprovado !== "boolean" || aprovado !== (acertos === totalCasos)) {
        throw new AppError(400, "RESULTADO_DE_EXERCICIO_INVALIDO", "O resultado enviado não corresponde aos casos desta prática.");
    }

    await repository.registrarTentativa({
        usuarioId: usuario.id,
        exercicioId: Number(exercicio.id),
        totalCasos,
        acertos,
        aprovado,
    });
    return { aulaId: idAula, aprovado, acertos, totalCasos };
}

module.exports = {
    listarAulasConcluidas,
    verificarConclusao,
    registrarTentativa,
    reiniciarPorCurso: repository.reiniciarPorCurso,
};
