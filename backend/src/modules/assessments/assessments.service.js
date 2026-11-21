const repository = require("./assessments.repository");
const usersRepository = require("../users/users.repository");
const coursesRepository = require("../courses/cursos.repository");
const progressRepository = require("../progress/progress.repository");
const AppError = require("../../shared/errors/AppError");
const { validarIdPositivo } = require("../../shared/validation/ids");

async function obterUsuario(firebaseUid) {
    const usuario = await usersRepository.buscarPorFirebaseUid(firebaseUid);
    if (!usuario) {
        throw new AppError(
            404,
            "PERFIL_NAO_ENCONTRADO",
            "Perfil não encontrado. Sincronize seu perfil antes de acessar avaliações."
        );
    }
    return usuario;
}

async function buscarPorCurso(firebaseUid, cursoId) {
    const usuario = await obterUsuario(firebaseUid);
    const idCurso = validarIdPositivo(cursoId, "ID do curso");
    const curso = await coursesRepository.buscarCursoPorId(idCurso);
    if (!curso) throw new AppError(404, "CURSO_NAO_ENCONTRADO", "Curso não encontrado.");

    const [totalAulas, aulasConcluidas] = await Promise.all([
        coursesRepository.contarAulasPorCurso(idCurso),
        progressRepository.listarAulasConcluidas(usuario.id, idCurso)
    ]);
    if (totalAulas === 0 || aulasConcluidas.length < totalAulas) {
        throw new AppError(
            403,
            "CURSO_NAO_CONCLUIDO",
            "Conclua todas as aulas do curso antes de abrir a avaliação."
        );
    }

    const avaliacao = await repository.buscarPorCurso(idCurso);
    if (!avaliacao) {
        throw new AppError(
            404,
            "AVALIACAO_NAO_ENCONTRADA",
            "Este curso ainda não possui avaliação configurada."
        );
    }

    const questoes = await repository.listarQuestoesPublicas(avaliacao.id);
    if (!questoes.length || questoes.some((questao) => questao.alternativas.length < 2)) {
        throw new AppError(409, "AVALIACAO_INCOMPLETA", "A avaliação está incompleta e não pode ser iniciada.");
    }
    const minimoAcertos = Number(avaliacao.minimo_acertos);
    if (!Number.isInteger(minimoAcertos) || minimoAcertos < 1 || minimoAcertos > questoes.length) {
        throw new AppError(
            409,
            "CRITERIO_DE_APROVACAO_INVALIDO",
            "O critério mínimo de aprovação da avaliação está inválido."
        );
    }

    return {
        id: Number(avaliacao.id),
        titulo: avaliacao.titulo,
        minimoAcertos: Number(avaliacao.minimo_acertos),
        questoes
    };
}

async function registrarTentativa(firebaseUid, avaliacaoId, respostas) {
    const idAvaliacao = validarIdPositivo(avaliacaoId, "ID da avaliação");
    const usuario = await obterUsuario(firebaseUid);
    const avaliacao = await repository.buscarPorId(idAvaliacao);
    if (!avaliacao) throw new AppError(404, "AVALIACAO_NAO_ENCONTRADA", "Avaliação não encontrada ou inativa.");

    const totalAulas = await coursesRepository.contarAulasPorCurso(avaliacao.curso_id);
    const aulasConcluidas = await progressRepository.listarAulasConcluidas(usuario.id, avaliacao.curso_id);
    if (totalAulas === 0 || aulasConcluidas.length < totalAulas) {
        throw new AppError(403, "CURSO_NAO_CONCLUIDO", "Conclua todas as aulas do curso antes de enviar a avaliação.");
    }

    if (!Array.isArray(respostas) || respostas.length === 0) {
        throw new AppError(400, "RESPOSTAS_OBRIGATORIAS", "Envie as respostas da avaliação.");
    }

    const questoesConfiguradas = await repository.listarQuestoesPublicas(idAvaliacao);
    if (!questoesConfiguradas.length || questoesConfiguradas.some((questao) => questao.alternativas.length < 2)) {
        throw new AppError(409, "AVALIACAO_INCOMPLETA", "A avaliação está incompleta e não pode ser corrigida.");
    }

    const corretasRows = await repository.listarCorretas(idAvaliacao);
    const porQuestao = new Map();
    const opcoesValidas = new Map();
    for (const row of corretasRows) {
        const qid = Number(row.questao_id);
        const aid = Number(row.alternativa_id);
        if (!opcoesValidas.has(qid)) opcoesValidas.set(qid, new Set());
        opcoesValidas.get(qid).add(aid);
        if (Number(row.correta) === 1) {
            if (porQuestao.has(qid)) {
                throw new AppError(
                    409,
                    "GABARITO_INVALIDO",
                    "A avaliação possui mais de uma alternativa correta para uma questão."
                );
            }
            porQuestao.set(qid, aid);
        }
    }

    const questionIds = questoesConfiguradas.map((questao) => Number(questao.id));
    if (questionIds.some((id) => !opcoesValidas.has(id) || !porQuestao.has(id))) {
        throw new AppError(
            409,
            "GABARITO_INCOMPLETO",
            "A avaliação possui questões sem uma alternativa correta configurada."
        );
    }
    const minimoAcertos = Number(avaliacao.minimo_acertos);
    if (!Number.isInteger(minimoAcertos) || minimoAcertos < 1 || minimoAcertos > questionIds.length) {
        throw new AppError(
            409,
            "CRITERIO_DE_APROVACAO_INVALIDO",
            "O critério mínimo de aprovação da avaliação está inválido."
        );
    }
    if (respostas.length !== questionIds.length) {
        throw new AppError(400, "RESPOSTAS_INCOMPLETAS", "Responda todas as questões antes de enviar a avaliação.");
    }

    const recebidas = new Map();
    for (const item of respostas) {
        const questaoId = validarIdPositivo(item?.questaoId, "ID da questão");
        const alternativaId = validarIdPositivo(item?.alternativaId, "ID da alternativa");
        if (recebidas.has(questaoId)) {
            throw new AppError(
                400,
                "RESPOSTA_DUPLICADA",
                "Há respostas duplicadas para uma questão."
            );
        }
        if (!opcoesValidas.get(questaoId)?.has(alternativaId)) {
            throw new AppError(
                400,
                "ALTERNATIVA_INVALIDA",
                "Uma alternativa enviada não pertence à questão correspondente."
            );
        }
        recebidas.set(questaoId, alternativaId);
    }

    if (questionIds.some((id) => !recebidas.has(id))) {
        throw new AppError(400, "RESPOSTAS_INCOMPLETAS", "Responda todas as questões antes de enviar a avaliação.");
    }

    const respostasValidadas = questionIds.map((questaoId) => ({
        questaoId,
        alternativaId: recebidas.get(questaoId),
        correta: recebidas.get(questaoId) === porQuestao.get(questaoId)
    }));
    const acertos = respostasValidadas.filter((resposta) => resposta.correta).length;
    const aprovada = acertos >= minimoAcertos;

    return repository.registrarTentativa({
        usuarioId: usuario.id,
        avaliacaoId: idAvaliacao,
        total: questionIds.length,
        acertos,
        aprovada,
        respostas: respostasValidadas
    });
}

module.exports = { buscarPorCurso, registrarTentativa };
