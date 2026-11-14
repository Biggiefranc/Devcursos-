const { pool } = require("../../shared/database/database");

async function listarPorUsuario(usuarioId) {
    const [rows] = await pool.execute(
        `SELECT c.id, c.titulo, c.descricao, c.categoria, c.nivel
         FROM favoritos f
         INNER JOIN cursos c ON c.id = f.curso_id
         WHERE f.usuario_id = ?
         ORDER BY f.criado_em DESC, f.id DESC`,
        [usuarioId]
    );
    return rows;
}

async function adicionar(usuarioId, cursoId) {
    await pool.execute(
        `INSERT INTO favoritos (usuario_id, curso_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE curso_id = VALUES(curso_id)`,
        [usuarioId, cursoId]
    );
}

async function remover(usuarioId, cursoId) {
    await pool.execute(
        "DELETE FROM favoritos WHERE usuario_id = ? AND curso_id = ?",
        [usuarioId, cursoId]
    );
}

module.exports = { listarPorUsuario, adicionar, remover };
