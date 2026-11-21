const { pool } = require("../../shared/database/database");
const { normalizarCurso } = require("../courses/cursos.repository");

async function listarPorUsuario(usuarioId) {
    const [rows] = await pool.execute(
        `SELECT c.id, c.titulo, c.descricao, c.categoria, c.nivel,
                c.duracao_horas, c.tecnologias, c.projeto_final
         FROM favoritos f
         INNER JOIN cursos c ON c.id = f.curso_id
         WHERE f.usuario_id = ?
         ORDER BY f.criado_em DESC, f.id DESC`,
        [usuarioId]
    );
    return rows.map(normalizarCurso);
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
