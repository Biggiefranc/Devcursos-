const { pool } = require("../src/shared/database/database");

async function migrar() {
    const [colunas] = await pool.execute(
        `SELECT COLUMN_NAME AS nome, COLUMN_TYPE AS tipo, CHARACTER_SET_NAME AS charset, IS_NULLABLE AS aceitaNulo
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'
           AND COLUMN_NAME IN ('firebase_uid', 'firebase_uid_exato')`,
    );
    const coluna = colunas.find(({ nome }) => nome === "firebase_uid");
    if (coluna?.tipo !== "varchar(128)" || coluna.charset !== "utf8mb4" || coluna.aceitaNulo !== "NO") {
        throw new Error("A coluna usuarios.firebase_uid não tem o formato utf8mb4 esperado. Revise o esquema antes de migrar.");
    }

    // O TiDB impede a troca de collation da coluna já indexada.
    if (!colunas.some(({ nome }) => nome === "firebase_uid_exato")) {
        await pool.execute(
            `ALTER TABLE usuarios ADD COLUMN firebase_uid_exato VARBINARY(512)
             GENERATED ALWAYS AS (CAST(firebase_uid AS BINARY)) VIRTUAL AFTER firebase_uid`,
        );
    }

    const [indices] = await pool.execute(
        `SELECT INDEX_NAME AS nome FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'`,
    );
    const nomesIndices = new Set(indices.map(({ nome }) => nome));

    // Garanta a unicidade exata antes de retirar a restrição antiga.
    if (!nomesIndices.has("uq_usuarios_firebase_uid_exato")) {
        await pool.execute("ALTER TABLE usuarios ADD UNIQUE KEY uq_usuarios_firebase_uid_exato (firebase_uid_exato)");
    }
    if (!nomesIndices.has("idx_usuarios_firebase_uid")) {
        await pool.execute("ALTER TABLE usuarios ADD KEY idx_usuarios_firebase_uid (firebase_uid)");
    }
    if (nomesIndices.has("uq_usuarios_firebase_uid")) {
        await pool.execute("ALTER TABLE usuarios DROP INDEX uq_usuarios_firebase_uid");
    }

    console.log("Unicidade binária de firebase_uid verificada.");
}

migrar()
    .catch((erro) => {
        console.error("Falha ao migrar firebase_uid:", erro.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
