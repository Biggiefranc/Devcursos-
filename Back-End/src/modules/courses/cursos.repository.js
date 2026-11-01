const { pool } = require("../../shared/database/database");

async function listarCursos() {
    const [cursos] = await pool.execute(`
        SELECT * FROM cursos
    `);

    return cursos;
}

async function buscarCursoPorId(id) {
    const [cursos] = await pool.execute(`
        SELECT
            id,
            titulo,
            descricao,
            categoria,
            nivel,
            data_criacao
        FROM cursos
        WHERE id = ?
    `, [id]);

    return cursos[0] || null;
}

async function listarModulosPorCurso(cursoId) {
    const [modulos] = await pool.execute(`
        SELECT
            id,
            curso_id,
            titulo,
            descricao,
            ordem
        FROM modulos
        WHERE curso_id = ?
        ORDER BY ordem ASC, id ASC
    `, [cursoId]);

    return modulos;
}

async function buscarModuloPorId(id) {
    const [modulos] = await pool.execute(`
        SELECT id
        FROM modulos
        WHERE id = ?
    `, [id]);

    return modulos[0] || null;
}

async function listarAulasPorModulo(moduloId) {
    const [aulas] = await pool.execute(`
        SELECT
            id,
            modulo_id,
            titulo,
            descricao,
            ordem
        FROM aulas
        WHERE modulo_id = ?
        ORDER BY ordem ASC, id ASC
    `, [moduloId]);

    return aulas;
}

async function buscarAulaPorId(id) {
    const [aulas] = await pool.execute(`
        SELECT
            id,
            modulo_id,
            titulo,
            descricao,
            conteudo,
            video_url,
            material_url,
            ordem
        FROM aulas
        WHERE id = ?
    `, [id]);

    return aulas[0] || null;
}

module.exports = {
    listarCursos,
    buscarCursoPorId,
    listarModulosPorCurso,
    buscarModuloPorId,
    listarAulasPorModulo,
    buscarAulaPorId
};