const { pool } = require("../../shared/database/database");

function normalizarTecnologias(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (!value) return [];

    try {
        const parsed = JSON.parse(String(value));
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
        // Compatibilidade com registros antigos preenchidos como texto separado por vírgulas.
    }

    return String(value).split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
}

function normalizarCurso(course) {
    if (!course) return null;
    return {
        ...course,
        duracao_horas: course.duracao_horas == null ? null : Number(course.duracao_horas),
        tecnologias: normalizarTecnologias(course.tecnologias)
    };
}

function agruparCurso(rows) {
    if (rows.length === 0) return null;

    const course = {
        id: rows[0].curso_id,
        titulo: rows[0].curso_titulo,
        descricao: rows[0].curso_descricao,
        categoria: rows[0].categoria,
        nivel: rows[0].nivel,
        duracao_horas: rows[0].duracao_horas,
        tecnologias: normalizarTecnologias(rows[0].tecnologias),
        projeto_final: rows[0].projeto_final,
        data_criacao: rows[0].data_criacao,
        modulos: []
    };
    const modulesById = new Map();

    for (const row of rows) {
        if (row.modulo_id === null) continue;

        let module = modulesById.get(row.modulo_id);
        if (!module) {
            module = {
                id: row.modulo_id,
                curso_id: course.id,
                titulo: row.modulo_titulo,
                descricao: row.modulo_descricao,
                ordem: row.modulo_ordem,
                aulas: []
            };
            modulesById.set(row.modulo_id, module);
            course.modulos.push(module);
        }

        if (row.aula_id !== null) {
            const lesson = {
                id: row.aula_id,
                modulo_id: module.id,
                titulo: row.aula_titulo,
                descricao: row.aula_descricao,
                duracao_minutos: row.aula_duracao_minutos == null
                    ? null
                    : Number(row.aula_duracao_minutos),
                ordem: row.aula_ordem
            };
            if (Object.hasOwn(row, "aula_conteudo")) lesson.conteudo = row.aula_conteudo;
            if (Object.hasOwn(row, "video_url")) lesson.video_url = row.video_url;
            if (Object.hasOwn(row, "material_url")) lesson.material_url = row.material_url;
            module.aulas.push(lesson);
        }
    }

    return course;
}

async function listarCursos() {
    const [cursos] = await pool.execute(`
        SELECT id, titulo, descricao, categoria, nivel,
               duracao_horas, tecnologias, projeto_final, data_criacao
        FROM cursos
        ORDER BY id DESC
    `);

    return cursos.map(normalizarCurso);
}

async function buscarCursoPorId(id) {
    const [cursos] = await pool.execute(`
        SELECT
            id,
            titulo,
            descricao,
            categoria,
            nivel,
            duracao_horas,
            tecnologias,
            projeto_final,
            data_criacao
        FROM cursos
        WHERE id = ?
    `, [id]);

    return normalizarCurso(cursos[0] || null);
}

const SELECT_CURSO_COM_MODULOS_E_AULAS = `
    SELECT c.id AS curso_id, c.titulo AS curso_titulo,
           c.descricao AS curso_descricao, c.categoria, c.nivel,
           c.duracao_horas, c.tecnologias, c.projeto_final, c.data_criacao,
           m.id AS modulo_id, m.titulo AS modulo_titulo,
           m.descricao AS modulo_descricao, m.ordem AS modulo_ordem,
           a.id AS aula_id, a.titulo AS aula_titulo,
           a.descricao AS aula_descricao,
           a.duracao_minutos AS aula_duracao_minutos,
           a.ordem AS aula_ordem
    FROM cursos c
    LEFT JOIN modulos m ON m.curso_id = c.id
    LEFT JOIN aulas a ON a.modulo_id = m.id
    WHERE c.id = ?
    ORDER BY m.ordem ASC, m.id ASC, a.ordem ASC, a.id ASC`;

// Estrutura pública para a página de currículo; não inclui o corpo das aulas.
async function buscarEstruturaPorCurso(cursoId) {
    const [rows] = await pool.execute(SELECT_CURSO_COM_MODULOS_E_AULAS, [cursoId]);
    return agruparCurso(rows);
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
            duracao_minutos,
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

async function buscarAulaParaEstudoPorId(id) {
    const [aulas] = await pool.execute(`
        SELECT
            a.id,
            a.modulo_id,
            m.curso_id,
            m.titulo AS modulo_titulo,
            a.titulo,
            a.descricao,
            a.conteudo,
            a.video_url,
            a.material_url,
            a.duracao_minutos,
            a.ordem
        FROM aulas a
        INNER JOIN modulos m ON m.id = a.modulo_id
        WHERE a.id = ?
    `, [id]);

    return aulas[0] || null;
}

module.exports = {
    listarCursos,
    buscarCursoPorId,
    normalizarCurso,
    normalizarTecnologias,
    buscarEstruturaPorCurso,
    listarModulosPorCurso,
    buscarModuloPorId,
    listarAulasPorModulo,
    contarAulasPorCurso,
    buscarAulaParaEstudoPorId
};
