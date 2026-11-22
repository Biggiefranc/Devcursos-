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
          AND (
              NOT EXISTS (SELECT 1 FROM exercicios_praticos ep WHERE ep.aula_id = a.id)
              OR EXISTS (
                  SELECT 1
                  FROM tentativas_exercicio te
                  INNER JOIN exercicios_praticos ep ON ep.id = te.exercicio_id
                  WHERE ep.aula_id = a.id
                    AND te.usuario_id = pa.usuario_id
                    AND te.aprovado = 1
              )
          )
        ORDER BY a.id ASC
    `;

    const [resultados] = await pool.execute(sql, [
        usuarioId,
        cursoId
    ]);

    return resultados.map((aula) => Number(aula.id));
}

async function listarResumoPorUsuario(usuarioId) {
    const [rows] = await pool.execute(
        `SELECT m.curso_id, a.id AS aula_id, a.titulo AS aula_titulo,
                CASE WHEN pa.concluida = 1 THEN 1 ELSE 0 END AS concluida
         FROM modulos m
         INNER JOIN aulas a ON a.modulo_id = m.id
         LEFT JOIN progresso_aulas pa
            ON pa.aula_id = a.id
           AND pa.usuario_id = ?
           AND pa.concluida = 1
         ORDER BY m.curso_id ASC, m.ordem ASC, m.id ASC,
                  a.ordem ASC, a.id ASC`,
        [usuarioId]
    );

    const resumo = new Map();
    for (const row of rows) {
        const courseId = Number(row.curso_id);
        if (!resumo.has(courseId)) {
            resumo.set(courseId, {
                cursoId: courseId,
                totalAulas: 0,
                aulasConcluidas: 0,
                proximaAula: null
            });
        }
        const course = resumo.get(courseId);
        course.totalAulas += 1;
        if (Number(row.concluida) === 1) {
            course.aulasConcluidas += 1;
        } else if (!course.proximaAula) {
            course.proximaAula = {
                id: Number(row.aula_id),
                titulo: row.aula_titulo
            };
        }
    }

    return [...resumo.values()];
}

// Verifica se uma aula existe.
async function buscarAulaPorId(aulaId) {
    const sql = `
        SELECT a.id, m.curso_id, m.ordem AS modulo_ordem
        FROM aulas a
        INNER JOIN modulos m ON m.id = a.modulo_id
        WHERE a.id = ?
        LIMIT 1
    `;

    const [aulas] = await pool.execute(sql, [aulaId]);

    return aulas[0] || null;
}

// Retorna uma aula anterior ainda não concluída no mesmo curso.
// A ordem é a mesma usada pela interface: módulo.ordem, aula.ordem e IDs.
async function buscarAulaAnteriorPendente(usuarioId, aulaId) {
    const sql = `
        SELECT anterior.id, anterior.titulo
        FROM aulas atual
        INNER JOIN modulos modulo_atual ON modulo_atual.id = atual.modulo_id
        INNER JOIN modulos modulo_anterior
            ON modulo_anterior.curso_id = modulo_atual.curso_id
        INNER JOIN aulas anterior ON anterior.modulo_id = modulo_anterior.id
        LEFT JOIN progresso_aulas pa
            ON pa.aula_id = anterior.id
           AND pa.usuario_id = ?
           AND pa.concluida = 1
        LEFT JOIN exercicios_praticos ep ON ep.aula_id = anterior.id
        WHERE atual.id = ?
          AND (
              modulo_anterior.ordem < modulo_atual.ordem
              OR (
                  modulo_anterior.ordem = modulo_atual.ordem
                  AND (
                      modulo_anterior.id < modulo_atual.id
                      OR (
                          modulo_anterior.id = modulo_atual.id
                          AND (
                              anterior.ordem < atual.ordem
                              OR (anterior.ordem = atual.ordem AND anterior.id < atual.id)
                          )
                      )
                  )
              )
          )
          AND (
              pa.id IS NULL
              OR (ep.id IS NOT NULL AND NOT EXISTS (
                  SELECT 1
                  FROM tentativas_exercicio te
                  WHERE te.exercicio_id = ep.id
                    AND te.usuario_id = ?
                    AND te.aprovado = 1
              ))
          )
        ORDER BY modulo_anterior.ordem ASC, anterior.ordem ASC, anterior.id ASC
        LIMIT 1
    `;

    const [aulas] = await pool.execute(sql, [usuarioId, aulaId, usuarioId]);
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

async function reiniciarPorCurso(usuarioId, cursoId) {
    await pool.execute(
        `DELETE te
         FROM tentativas_exercicio te
         INNER JOIN exercicios_praticos ep ON ep.id = te.exercicio_id
         INNER JOIN aulas a ON a.id = ep.aula_id
         INNER JOIN modulos m ON m.id = a.modulo_id
         WHERE te.usuario_id = ? AND m.curso_id = ?`,
        [usuarioId, cursoId]
    );
    await pool.execute(
        `DELETE t
         FROM tentativas_avaliacao t
         INNER JOIN avaliacoes av ON av.id = t.avaliacao_id
         LEFT JOIN modulos m ON m.id = av.modulo_id
         WHERE t.usuario_id = ? AND (av.curso_id = ? OR m.curso_id = ?)`,
        [usuarioId, cursoId, cursoId]
    );
    await pool.execute(
        `DELETE pa
         FROM progresso_aulas pa
         INNER JOIN aulas a ON a.id = pa.aula_id
         INNER JOIN modulos m ON m.id = a.modulo_id
         WHERE pa.usuario_id = ? AND m.curso_id = ?`,
        [usuarioId, cursoId]
    );
}

module.exports = {
    listarAulasConcluidas,
    listarResumoPorUsuario,
    buscarAulaPorId,
    buscarAulaAnteriorPendente,
    concluirAula,
    desmarcarAula,
    reiniciarPorCurso
};
