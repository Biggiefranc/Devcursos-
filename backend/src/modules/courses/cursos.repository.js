const { pool } = require("../../shared/database/database");

async function listarCursos() {
    const [cursos] = await pool.execute(`
        SELECT id, titulo, descricao, categoria, nivel, data_criacao
        FROM cursos
        ORDER BY id DESC
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

// Carrega a estrutura completa do curso em uma consulta para evitar N+1 no cliente.
async function buscarConteudoPorCurso(cursoId) {
    const [rows] = await pool.execute(
        `SELECT c.id AS curso_id, c.titulo AS curso_titulo,
                c.descricao AS curso_descricao, c.categoria, c.nivel,
                c.data_criacao, m.id AS modulo_id, m.titulo AS modulo_titulo,
                m.descricao AS modulo_descricao, m.ordem AS modulo_ordem,
                a.id AS aula_id, a.titulo AS aula_titulo,
                a.descricao AS aula_descricao, a.conteudo AS aula_conteudo,
                a.video_url, a.material_url, a.ordem AS aula_ordem
         FROM cursos c
         LEFT JOIN modulos m ON m.curso_id = c.id
         LEFT JOIN aulas a ON a.modulo_id = m.id
         WHERE c.id = ?
         ORDER BY m.ordem ASC, m.id ASC, a.ordem ASC, a.id ASC`,
        [cursoId]
    );

    if (rows.length === 0) return null;

    const curso = {
        id: rows[0].curso_id,
        titulo: rows[0].curso_titulo,
        descricao: rows[0].curso_descricao,
        categoria: rows[0].categoria,
        nivel: rows[0].nivel,
        data_criacao: rows[0].data_criacao,
        modulos: []
    };
    const modulosPorId = new Map();

    for (const row of rows) {
        if (row.modulo_id === null) continue;

        let modulo = modulosPorId.get(row.modulo_id);
        if (!modulo) {
            modulo = {
                id: row.modulo_id,
                curso_id: curso.id,
                titulo: row.modulo_titulo,
                descricao: row.modulo_descricao,
                ordem: row.modulo_ordem,
                aulas: []
            };
            modulosPorId.set(row.modulo_id, modulo);
            curso.modulos.push(modulo);
        }

        if (row.aula_id !== null) {
            modulo.aulas.push({
                id: row.aula_id,
                modulo_id: modulo.id,
                titulo: row.aula_titulo,
                descricao: row.aula_descricao,
                conteudo: row.aula_conteudo,
                video_url: row.video_url,
                material_url: row.material_url,
                ordem: row.aula_ordem
            });
        }
    }

    return curso;
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

async function contarAulasPorCurso(cursoId) {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM aulas a
         INNER JOIN modulos m ON m.id = a.modulo_id
         WHERE m.curso_id = ?`,
        [cursoId]
    );
    return Number(rows[0]?.total || 0);
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
    buscarConteudoPorCurso,
    listarModulosPorCurso,
    buscarModuloPorId,
    listarAulasPorModulo,
    contarAulasPorCurso,
    buscarAulaPorId
};
