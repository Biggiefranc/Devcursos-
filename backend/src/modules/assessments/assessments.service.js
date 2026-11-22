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
            "Perfil não encontrado. Sincronize seu perfil antes de acessar avaliações.",
        );
    }
    return usuario;
}

function cursoDaAvaliacao(avaliacao) {
    return Number(avaliacao.curso_id ?? avaliacao.modulo_curso_id);
}

async function validarAcesso(usuario, avaliacao) {
    const cursoId = cursoDaAvaliacao(avaliacao);
    if (!Number.isInteger(cursoId) || cursoId < 1) {
        throw new AppError(409, "AVALIACAO_SEM_CURSO", "A avaliação não está vinculada a um curso válido.");
    }

    if (avaliacao.modulo_id != null) {
        const moduloId = Number(avaliacao.modulo_id);
        const [total, concluidas] = await Promise.all([
            repository.contarAulasPorModulo(moduloId),
            repository.listarAulasConcluidasPorModulo(usuario.id, moduloId),
        ]);
        if (total === 0 || concluidas < total) {
            throw new AppError(
                403,
                "MODULO_NAO_CONCLUIDO",
                "Conclua as aulas e os exercícios deste módulo antes de abrir a avaliação.",
            );
        }
        const pendente = await repository.buscarAvaliacaoModuloAnteriorPendente(
            usuario.id,
            cursoId,
            Number(avaliacao.modulo_ordem),
        );
        if (pendente) {
            throw new AppError(
                403,
                "AVALIACAO_ANTERIOR_PENDENTE",
                `Conclua a avaliação de “${pendente.modulo_titulo}” antes de avançar.`,
            );
        }
        return;
    }

    const [totalAulas, aulasConcluidas] = await Promise.all([
        coursesRepository.contarAulasPorCurso(cursoId),
        progressRepository.listarAulasConcluidas(usuario.id, cursoId),
    ]);
    if (totalAulas === 0 || aulasConcluidas.length < totalAulas) {
        throw new AppError(
            403,
            "CURSO_NAO_CONCLUIDO",
            "Conclua todas as aulas e práticas do curso antes da avaliação final.",
        );
    }
    const avaliacaoPendente = await repository.buscarAvaliacaoModuloAnteriorPendente(
        usuario.id,
        cursoId,
    );
    if (avaliacaoPendente) {
        throw new AppError(
            403,
            "AVALIACOES_DE_MODULO_PENDENTES",
            `Aprove a avaliação do módulo “${avaliacaoPendente.modulo_titulo}” antes da prova final.`,
        );
    }
}

async function carregarQuestaoConfigurada(avaliacaoId) {
    const questoes = await repository.listarQuestoesPublicas(avaliacaoId);
    if (!questoes.length || questoes.some((questao) => questao.alternativas.length < 2)) {
        throw new AppError(
            409,
            "AVALIACAO_INCOMPLETA",
            "A avaliação está incompleta e não pode ser iniciada.",
        );
    }
    return questoes;
}

async function obterConteudoAvaliacao(firebaseUid, avaliacao) {
    const usuario = await obterUsuario(firebaseUid);
    await validarAcesso(usuario, avaliacao);
    const questoes = await carregarQuestaoConfigurada(avaliacao.id);
    const minimoAcertos = Number(avaliacao.minimo_acertos);
    if (!Number.isInteger(minimoAcertos) || minimoAcertos < 1 || minimoAcertos > questoes.length) {
        throw new AppError(
            409,
            "CRITERIO_DE_APROVACAO_INVALIDO",
            "O critério mínimo de aprovação desta avaliação está inválido.",
        );
    }
    return {
        id: Number(avaliacao.id),
        cursoId: cursoDaAvaliacao(avaliacao),
        moduloId: avaliacao.modulo_id == null ? null : Number(avaliacao.modulo_id),
        titulo: avaliacao.titulo,
        minimoAcertos,
        questoes,
    };
}

async function buscarPorCurso(firebaseUid, cursoId) {
    const idCurso = validarIdPositivo(cursoId, "ID do curso");
    const curso = await coursesRepository.buscarCursoPorId(idCurso);
    if (!curso) throw new AppError(404, "CURSO_NAO_ENCONTRADO", "Curso não encontrado.");

    const avaliacao = await repository.buscarPorCurso(idCurso);
    if (!avaliacao) {
        throw new AppError(404, "AVALIACAO_NAO_ENCONTRADA", "Este curso ainda não possui avaliação final configurada.");
    }
    return obterConteudoAvaliacao(firebaseUid, avaliacao);
}

async function buscarPorId(firebaseUid, avaliacaoId) {
    const idAvaliacao = validarIdPositivo(avaliacaoId, "ID da avaliação");
    const avaliacao = await repository.buscarPorId(idAvaliacao);
    if (!avaliacao) {
        throw new AppError(404, "AVALIACAO_NAO_ENCONTRADA", "Avaliação não encontrada ou inativa.");
    }
    return obterConteudoAvaliacao(firebaseUid, avaliacao);
}

async function registrarTentativa(firebaseUid, avaliacaoId, respostas) {
    const idAvaliacao = validarIdPositivo(avaliacaoId, "ID da avaliação");
    const usuario = await obterUsuario(firebaseUid);
    const avaliacao = await repository.buscarPorId(idAvaliacao);
    if (!avaliacao) {
        throw new AppError(404, "AVALIACAO_NAO_ENCONTRADA", "Avaliação não encontrada ou inativa.");
    }
    await validarAcesso(usuario, avaliacao);

    if (!Array.isArray(respostas) || respostas.length === 0) {
        throw new AppError(400, "RESPOSTAS_OBRIGATORIAS", "Envie as respostas da avaliação.");
    }

    const questoesConfiguradas = await carregarQuestaoConfigurada(idAvaliacao);
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
                throw new AppError(409, "GABARITO_INVALIDO", "Há mais de uma resposta correta em uma questão.");
            }
            porQuestao.set(qid, aid);
        }
    }

    const idsQuestoes = questoesConfiguradas.map((questao) => Number(questao.id));
    if (idsQuestoes.some((id) => !opcoesValidas.has(id) || !porQuestao.has(id))) {
        throw new AppError(409, "GABARITO_INCOMPLETO", "Uma questão está sem resposta correta configurada.");
    }
    const minimoAcertos = Number(avaliacao.minimo_acertos);
    if (!Number.isInteger(minimoAcertos) || minimoAcertos < 1 || minimoAcertos > idsQuestoes.length) {
        throw new AppError(409, "CRITERIO_DE_APROVACAO_INVALIDO", "O mínimo de acertos desta avaliação é inválido.");
    }
    if (respostas.length !== idsQuestoes.length) {
        throw new AppError(400, "RESPOSTAS_INCOMPLETAS", "Responda todas as questões antes de enviar.");
    }

    const recebidas = new Map();
    for (const item of respostas) {
        const questaoId = validarIdPositivo(item?.questaoId, "ID da questão");
        const alternativaId = validarIdPositivo(item?.alternativaId, "ID da alternativa");
        if (recebidas.has(questaoId)) {
            throw new AppError(400, "RESPOSTA_DUPLICADA", "Há respostas duplicadas para uma questão.");
        }
        if (!opcoesValidas.get(questaoId)?.has(alternativaId)) {
            throw new AppError(400, "ALTERNATIVA_INVALIDA", "Uma alternativa não pertence à questão correspondente.");
        }
        recebidas.set(questaoId, alternativaId);
    }
    if (idsQuestoes.some((id) => !recebidas.has(id))) {
        throw new AppError(400, "RESPOSTAS_INCOMPLETAS", "Responda todas as questões antes de enviar.");
    }

    const respostasValidadas = idsQuestoes.map((questaoId) => ({
        questaoId,
        alternativaId: recebidas.get(questaoId),
        correta: recebidas.get(questaoId) === porQuestao.get(questaoId),
    }));
    const acertos = respostasValidadas.filter((resposta) => resposta.correta).length;
    return repository.registrarTentativa({
        usuarioId: usuario.id,
        avaliacaoId: idAvaliacao,
        total: idsQuestoes.length,
        acertos,
        aprovada: acertos >= minimoAcertos,
        respostas: respostasValidadas,
    });
}

module.exports = { buscarPorCurso, buscarPorId, registrarTentativa };
