const { pool } = require("../../shared/database/database");

async function buscarPorCurso(cursoId) {
    const [rows] = await pool.execute(
        `SELECT id, curso_id, titulo, minimo_acertos
         FROM avaliacoes
         WHERE curso_id = ? AND ativa = 1
         LIMIT 1`,
        [cursoId]
    );
    return rows[0] || null;
}

async function buscarPorId(avaliacaoId) {
    const [rows] = await pool.execute(
        `SELECT id, curso_id, titulo, minimo_acertos
         FROM avaliacoes
         WHERE id = ? AND ativa = 1
         LIMIT 1`,
        [avaliacaoId]
    );
    return rows[0] || null;
}

async function listarQuestoesPublicas(avaliacaoId) {
    const [rows] = await pool.execute(
        `SELECT q.id AS questao_id, q.enunciado, q.ordem AS questao_ordem,
                a.id AS alternativa_id, a.texto AS alternativa_texto,
                a.ordem AS alternativa_ordem
         FROM questoes_avaliacao q
         LEFT JOIN alternativas_avaliacao a ON a.questao_id = q.id
         WHERE q.avaliacao_id = ?
         ORDER BY q.ordem ASC, q.id ASC, a.ordem ASC, a.id ASC`,
        [avaliacaoId]
    );

    const questoes = new Map();
    for (const row of rows) {
        const key = Number(row.questao_id);
        if (!questoes.has(key)) {
            questoes.set(key, {
                id: key,
                enunciado: row.enunciado,
                alternativas: []
            });
        }
        if (row.alternativa_id !== null) {
            questoes.get(key).alternativas.push({
                id: Number(row.alternativa_id),
                texto: row.alternativa_texto
            });
        }
    }
    return [...questoes.values()];
}

async function registrarTentativa({ usuarioId, avaliacaoId, total, acertos, aprovada, respostas }) {
    const connection = await pool.getConnection();
    let descartarConexao = false;

    try {
        await connection.beginTransaction();
        const [insert] = await connection.execute(
            `INSERT INTO tentativas_avaliacao
                (usuario_id, avaliacao_id, total_questoes, acertos, aprovada)
             VALUES (?, ?, ?, ?, ?)`,
            [usuarioId, avaliacaoId, total, acertos, aprovada ? 1 : 0]
        );

        for (const resposta of respostas) {
            await connection.execute(
                `INSERT INTO respostas_avaliacao
                    (tentativa_id, questao_id, alternativa_id, correta)
                 VALUES (?, ?, ?, ?)`,
                [insert.insertId, resposta.questaoId, resposta.alternativaId, resposta.correta ? 1 : 0]
            );
        }

        await connection.commit();
        return {
            id: Number(insert.insertId),
            totalQuestoes: total,
            acertos,
            aprovada
        };
    } catch (erro) {
        try {
            await connection.rollback();
        } catch (erroRollback) {
            descartarConexao = true;
            erro.erroRollback = erroRollback;
        }
        throw erro;
    } finally {
        if (descartarConexao) connection.destroy();
        else connection.release();
    }
}

async function listarCorretas(avaliacaoId) {
    const [rows] = await pool.execute(
        `SELECT q.id AS questao_id, a.id AS alternativa_id, a.correta
         FROM questoes_avaliacao q
         INNER JOIN alternativas_avaliacao a ON a.questao_id = q.id
         WHERE q.avaliacao_id = ?
         ORDER BY q.id, a.id`,
        [avaliacaoId]
    );
    return rows;
}

module.exports = {
    buscarPorCurso,
    buscarPorId,
    listarQuestoesPublicas,
    listarCorretas,
    registrarTentativa
};
