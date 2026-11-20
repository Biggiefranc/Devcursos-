const progressRepository = require("./progress.repository");
const usersRepository = require("../users/users.repository");
const coursesRepository = require("../courses/cursos.repository");
const AppError = require("../../shared/errors/AppError");
const { validarIdPositivo } = require("../../shared/validation/ids");

// Resolve o UID do Firebase para o ID interno do MySQL.
async function obterUsuarioId(firebaseUid) {
    const usuario = await usersRepository.buscarPorFirebaseUid(firebaseUid);

    if (!usuario) {
        throw new AppError(
            404,
            "PERFIL_NAO_ENCONTRADO",
            "Perfil não encontrado. Sincronize seu perfil antes de acessar o progresso."
        );
    }

    return usuario.id;
}

// Lista as aulas concluídas de um curso.
async function listarProgresso(firebaseUid, cursoId) {
    const idCurso = validarIdPositivo(cursoId, "ID do curso");
    const usuarioId = await obterUsuarioId(firebaseUid);

    const curso = await coursesRepository.buscarCursoPorId(idCurso);
    if (!curso) {
        throw new AppError(404, "CURSO_NAO_ENCONTRADO", "Curso não encontrado.");
    }

    const aulasConcluidas =
        await progressRepository.listarAulasConcluidas(
            usuarioId,
            idCurso
        );

    return { aulasConcluidas };
}

// Atualiza o estado de conclusão de uma aula.
async function atualizarConclusao(firebaseUid, aulaId, concluida) {
    const idAula = validarIdPositivo(aulaId, "ID da aula");

    if (typeof concluida !== "boolean") {
        throw new AppError(
            400,
            "ESTADO_DE_CONCLUSAO_INVALIDO",
            "O campo concluida deve ser verdadeiro ou falso."
        );
    }

    const usuarioId = await obterUsuarioId(firebaseUid);

    const aula = await progressRepository.buscarAulaPorId(idAula);

    if (!aula) {
        throw new AppError(404, "AULA_NAO_ENCONTRADA", "Aula não encontrada.");
    }

    if (concluida) {
        const aulaAnteriorPendente =
            await progressRepository.buscarAulaAnteriorPendente(usuarioId, idAula);

        if (aulaAnteriorPendente) {
            throw new AppError(
                409,
                "AULA_ANTERIOR_PENDENTE",
                "Conclua as aulas anteriores antes de avançar neste curso."
            );
        }

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
