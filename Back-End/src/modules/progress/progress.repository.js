const { pool } = require("../../shared/database/database");

// Busca as aulas concluídas de um curso por usuário.
async function listarAulasConcluidas(usuarioId, cursoId) {
    const sql = `
        SELECT a.id
        FROM progresso_aulas pa
        INNER JOIN aulas a ON a.id = pa.aula_id
        INNER JOIN modulos m ON m.id = a.modulo_id
        WHERE pa.usuario_id = ?
          AND m.curso_id = ?
          AND pa.concluida = 1
        ORDER BY a.id ASC
    `;

    const [resultados] = await pool.execute(sql, [
        usuarioId,
        cursoId
    ]);

    return resultados.map((aula) => Number(aula.id));
}

// Verifica se uma aula existe.
async function buscarAulaPorId(aulaId) {
    const sql = `
        SELECT id
        FROM aulas
        WHERE id = ?
        LIMIT 1
    `;

    const [aulas] = await pool.execute(sql, [aulaId]);

    return aulas[0] || null;
}

// Marca uma aula como concluída.
async function concluirAula(usuarioId, aulaId) {
    const sql = `
        INSERT INTO progresso_aulas (usuario_id, aula_id, concluida)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE
            concluida = 1,
            atualizada_em = CURRENT_TIMESTAMP
    `;

    await pool.execute(sql, [usuarioId, aulaId]);
}

// Remove o registro de progresso de uma aula.
async function desmarcarAula(usuarioId, aulaId) {
    const sql = `
        DELETE FROM progresso_aulas
        WHERE usuario_id = ?
          AND aula_id = ?
    `;

    await pool.execute(sql, [usuarioId, aulaId]);
}

module.exports = {
    listarAulasConcluidas,
    buscarAulaPorId,
    concluirAula,
    desmarcarAula
};