const progressRepository = require("./progress.repository");
const usersRepository = require("../users/users.repository");

// Valida IDs recebidos pela API.
function validarId(id) {
    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
        const erro = new Error("Identificador inválido.");
        erro.statusCode = 400;
        throw erro;
    }

    return idNumerico;
}

// Resolve o UID do Firebase para o ID interno do MySQL.
async function obterUsuarioId(firebaseUid) {
    const usuario = await usersRepository.buscarPorFirebaseUid(firebaseUid);

    if (!usuario) {
        const erro = new Error(
            "Perfil não encontrado. Sincronize seu perfil antes de acessar o progresso."
        );
        erro.statusCode = 404;
        throw erro;
    }

    return usuario.id;
}

// Lista as aulas concluídas de um curso.
async function listarProgresso(firebaseUid, cursoId) {
    const idCurso = validarId(cursoId);
    const usuarioId = await obterUsuarioId(firebaseUid);

    const aulasConcluidas =
        await progressRepository.listarAulasConcluidas(
            usuarioId,
            idCurso
        );

    return { aulasConcluidas };
}

// Atualiza o estado de conclusão de uma aula.
async function atualizarConclusao(firebaseUid, aulaId, concluida) {
    const idAula = validarId(aulaId);

    if (typeof concluida !== "boolean") {
        const erro = new Error(
            "O campo concluida deve ser verdadeiro ou falso."
        );
        erro.statusCode = 400;
        throw erro;
    }

    const usuarioId = await obterUsuarioId(firebaseUid);

    const aula = await progressRepository.buscarAulaPorId(idAula);

    if (!aula) {
        const erro = new Error("Aula não encontrada.");
        erro.statusCode = 404;
        throw erro;
    }

    if (concluida) {
        await progressRepository.concluirAula(usuarioId, idAula);
    } else {
        await progressRepository.desmarcarAula(usuarioId, idAula);
    }

    return {
        aulaId: idAula,
        concluida
    };
}

module.exports = {
    listarProgresso,
    atualizarConclusao
};