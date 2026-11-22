const { pool } = require("../../shared/database/database");

async function buscarExercicioPorAula(aulaId) {
    const [rows] = await pool.execute(
        `SELECT ep.id, ep.aula_id, ep.avaliador_json
         FROM exercicios_praticos ep
         WHERE ep.aula_id = ?
         LIMIT 1`,
        [aulaId],
    );
    return rows[0] || null;
}

async function registrarTentativa({ usuarioId, exercicioId, totalCasos, acertos, aprovado }) {
    await pool.execute(
        `INSERT INTO tentativas_exercicio
            (usuario_id, exercicio_id, total_casos, acertos, aprovado)
         VALUES (?, ?, ?, ?, ?)`,
        [usuarioId, exercicioId, totalCasos, acertos, aprovado ? 1 : 0],
    );
}

async function possuiConclusaoAprovada(usuarioId, aulaId) {
    const [rows] = await pool.execute(
        `SELECT 1
         FROM tentativas_exercicio te
         INNER JOIN exercicios_praticos ep ON ep.id = te.exercicio_id
         WHERE te.usuario_id = ? AND ep.aula_id = ? AND te.aprovado = 1
         LIMIT 1`,
        [usuarioId, aulaId],
    );
    return rows.length > 0;
}

async function listarAulasComExerciciosAprovados(usuarioId, cursoId) {
    const [rows] = await pool.execute(
        `SELECT DISTINCT ep.aula_id
         FROM tentativas_exercicio te
         INNER JOIN exercicios_praticos ep ON ep.id = te.exercicio_id
         INNER JOIN aulas a ON a.id = ep.aula_id
         INNER JOIN modulos m ON m.id = a.modulo_id
         WHERE te.usuario_id = ? AND m.curso_id = ? AND te.aprovado = 1
         ORDER BY ep.aula_id ASC`,
        [usuarioId, cursoId],
    );
    return rows.map((row) => Number(row.aula_id));
}

async function reiniciarPorCurso(usuarioId, cursoId) {
    await pool.execute(
        `DELETE te
         FROM tentativas_exercicio te
         INNER JOIN exercicios_praticos ep ON ep.id = te.exercicio_id
         INNER JOIN aulas a ON a.id = ep.aula_id
         INNER JOIN modulos m ON m.id = a.modulo_id
         WHERE te.usuario_id = ? AND m.curso_id = ?`,
        [usuarioId, cursoId],
    );
}

module.exports = {
    buscarExercicioPorAula,
    registrarTentativa,
    possuiConclusaoAprovada,
    listarAulasComExerciciosAprovados,
    reiniciarPorCurso,
};
