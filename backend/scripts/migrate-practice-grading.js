const { pool } = require("../src/shared/database/database");

async function migrar() {
    const [colunas] = await pool.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tentativas_exercicio'
           AND COLUMN_NAME = 'verificada_isoladamente'`,
    );
    if (colunas.length === 0) {
        await pool.execute(
            `ALTER TABLE tentativas_exercicio
             ADD COLUMN verificada_isoladamente TINYINT(1) NOT NULL DEFAULT 0 AFTER aprovado`,
        );
    }
    console.log("Origem da correção das práticas configurada.");
}

migrar()
    .catch((erro) => {
        console.error("Falha ao migrar a correção das práticas:", erro.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
