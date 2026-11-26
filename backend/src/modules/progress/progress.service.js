const progressRepository = require("./progress.repository");
const usersRepository = require("../users/users.repository");
const coursesRepository = require("../courses/cursos.repository");
const assessmentsRepository = require("../assessments/assessments.repository");
const practiceService = require("../practice/practice.service");
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

    const [aulasConcluidas, exerciciosConcluidos, avaliacoesAprovadas] = await Promise.all([
        progressRepository.listarAulasConcluidas(
            usuarioId,
            idCurso
        ),
        practiceService.listarAulasConcluidas(firebaseUid, idCurso),
        assessmentsRepository.listarAprovadasPorCurso(usuarioId, idCurso),
    ]);

    return { aulasConcluidas, exerciciosConcluidos, avaliacoesAprovadas };
}

async function listarResumo(firebaseUid) {
    const usuarioId = await obterUsuarioId(firebaseUid);
    return progressRepository.listarResumoPorUsuario(usuarioId);
}

// Entrega apenas uma aula por vez e verifica no servidor se as anteriores foram concluídas.
async function buscarAulaLiberada(firebaseUid, aulaId) {
    const idAula = validarIdPositivo(aulaId, "ID da aula");
    const usuarioId = await obterUsuarioId(firebaseUid);
    const aula = await coursesRepository.buscarAulaParaEstudoPorId(idAula);

    if (!aula) {
        throw new AppError(404, "AULA_NAO_ENCONTRADA", "Aula não encontrada.");
    }

    const anteriorPendente = await progressRepository.buscarAulaAnteriorPendente(
        usuarioId,
        idAula
    );
    if (anteriorPendente) {
        throw new AppError(
            409,
            "AULA_ANTERIOR_PENDENTE",
            `Conclua “${anteriorPendente.titulo}” para desbloquear esta aula.`
        );
    }

    const avaliacaoAnterior = await assessmentsRepository.buscarAvaliacaoModuloAnteriorPendente(
        usuarioId,
        Number(aula.curso_id),
        Number(aula.modulo_ordem),
    );
    if (avaliacaoAnterior) {
        throw new AppError(
            409,
            "AVALIACAO_DE_MODULO_PENDENTE",
            `Aprove a avaliação de “${avaliacaoAnterior.modulo_titulo}” antes de avançar.`,
        );
    }

    return {
        ...aula,
        duracao_minutos: aula.duracao_minutos == null
            ? null
            : Number(aula.duracao_minutos)
    };
}

async function reiniciarProgresso(firebaseUid, cursoId) {
    const idCurso = validarIdPositivo(cursoId, "ID do curso");
    const usuarioId = await obterUsuarioId(firebaseUid);
    const curso = await coursesRepository.buscarCursoPorId(idCurso);

    if (!curso) {
        throw new AppError(404, "CURSO_NAO_ENCONTRADO", "Curso não encontrado.");
    }

    await progressRepository.reiniciarPorCurso(usuarioId, idCurso);
    return { cursoId: idCurso, reiniciado: true };
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

    const aula = await progressRepository.buscarAulaPorId(idAula, usuarioId);

    if (!aula) {
        throw new AppError(404, "AULA_NAO_ENCONTRADA", "Aula não encontrada.");
    }

    if (concluida) {
        if (Number(aula.concluida) === 1) return { aulaId: idAula, concluida };

        const exercicioAprovado = await practiceService.verificarConclusao(firebaseUid, idAula);
        if (!exercicioAprovado) {
            throw new AppError(
                403,
                "EXERCICIO_PENDENTE",
                "Execute o exercício e passe pelos casos de verificação antes de concluir a aula.",
            );
        }

        const avaliacaoAnterior = await assessmentsRepository.buscarAvaliacaoModuloAnteriorPendente(
            usuarioId,
            Number(aula.curso_id),
            Number(aula.modulo_ordem),
        );
        if (avaliacaoAnterior) {
            throw new AppError(
                403,
                "AVALIACAO_DE_MODULO_PENDENTE",
                `Aprove a avaliação de “${avaliacaoAnterior.modulo_titulo}” antes de avançar.`,
            );
        }

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
    listarResumo,
    buscarAulaLiberada,
    reiniciarProgresso,
    atualizarConclusao
};
