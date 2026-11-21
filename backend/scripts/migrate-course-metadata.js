const { pool } = require("../src/shared/database/database");

const columnsByTable = {
  cursos: {
    duracao_horas: "DECIMAL(6,2) NULL AFTER nivel",
    tecnologias: "JSON NULL AFTER duracao_horas",
    projeto_final: "TEXT NULL AFTER tecnologias",
  },
  aulas: {
    duracao_minutos: "SMALLINT UNSIGNED NULL AFTER material_url",
  },
};

async function migrate() {
  for (const [table, definitions] of Object.entries(columnsByTable)) {
    const [rows] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table],
    );
    const existing = new Set(rows.map((row) => row.COLUMN_NAME));

    for (const [column, definition] of Object.entries(definitions)) {
      if (existing.has(column)) continue;
      await pool.execute(
        `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`,
      );
      console.log(`Coluna adicionada: ${table}.${column}`);
    }
  }

  const knownTechnologies = [
    ["Python para Iniciantes", "Python"],
    ["Introdução a JavaScript", "JavaScript"],
    ["Git e GitHub Essencial", "Git,GitHub"],
  ];
  for (const [title, technologies] of knownTechnologies) {
    await pool.execute(
      `UPDATE cursos SET tecnologias = JSON_ARRAY(${technologies
        .split(",")
        .map(() => "?")
        .join(",")})
       WHERE titulo = ? AND tecnologias IS NULL`,
      [...technologies.split(","), title],
    );
  }

  console.log("Metadados dos cursos prontos para uso.");
}

migrate()
  .catch((error) => {
    console.error("Falha ao migrar os metadados dos cursos:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
