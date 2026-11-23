const { pool } = require("../src/shared/database/database");

async function migrar() {
    const [colunas] = await pool.execute(`
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cursos' AND COLUMN_NAME = 'linguagem'
    `);
    if (!colunas.length) await pool.execute("ALTER TABLE cursos ADD COLUMN linguagem VARCHAR(20) NULL");
    await pool.execute("UPDATE cursos SET linguagem = 'python' WHERE titulo = ? AND linguagem IS NULL",
        ["Lógica de Programação com Python"]);
    console.log("Linguagem do editor configurada para o curso de Lógica de Programação.");
}

migrar().catch((erro) => {
    console.error("Falha ao migrar a linguagem do curso:", erro.message);
    process.exitCode = 1;
}).finally(() => pool.end());
