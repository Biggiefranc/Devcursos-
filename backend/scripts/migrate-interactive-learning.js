const { pool } = require("../src/shared/database/database");

async function existeColuna(tabela, coluna) {
    const [rows] = await pool.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tabela, coluna],
    );
    return rows.length > 0;
}

async function existeIndice(tabela, indice) {
    const [rows] = await pool.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        [tabela, indice],
    );
    return rows.length > 0;
}

async function existeChaveEstrangeira(tabela, chave) {
    const [rows] = await pool.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ?
           AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
        [tabela, chave],
    );
    return rows.length > 0;
}

async function migrar() {
    if (!(await existeColuna("avaliacoes", "curso_id"))) {
        throw new Error("A tabela avaliacoes não possui a coluna curso_id esperada.");
    }

    await pool.execute("ALTER TABLE avaliacoes MODIFY curso_id INT UNSIGNED NULL");
    if (!(await existeColuna("avaliacoes", "modulo_id"))) {
        await pool.execute(
            "ALTER TABLE avaliacoes ADD COLUMN modulo_id INT UNSIGNED NULL AFTER curso_id",
        );
        console.log("Coluna adicionada: avaliacoes.modulo_id");
    }

    if (!(await existeIndice("avaliacoes", "uq_avaliacao_modulo"))) {
        await pool.execute(
            "ALTER TABLE avaliacoes ADD UNIQUE KEY uq_avaliacao_modulo (modulo_id)",
        );
        console.log("Índice criado: avaliacoes.uq_avaliacao_modulo");
    }

    if (!(await existeChaveEstrangeira("avaliacoes", "fk_avaliacao_modulo"))) {
        await pool.execute(
            `ALTER TABLE avaliacoes
             ADD CONSTRAINT fk_avaliacao_modulo
             FOREIGN KEY (modulo_id) REFERENCES modulos (id) ON DELETE CASCADE`,
        );
        console.log("Relacionamento criado: avaliacoes.modulo_id → modulos.id");
    }

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS exercicios_praticos (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            aula_id INT UNSIGNED NOT NULL,
            titulo VARCHAR(180) NOT NULL,
            enunciado TEXT NOT NULL,
            codigo_inicial MEDIUMTEXT NOT NULL,
            avaliador_json JSON NOT NULL,
            criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_exercicio_aula (aula_id),
            CONSTRAINT fk_exercicio_aula FOREIGN KEY (aula_id)
                REFERENCES aulas (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS tentativas_exercicio (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            usuario_id INT UNSIGNED NOT NULL,
            exercicio_id INT UNSIGNED NOT NULL,
            total_casos SMALLINT UNSIGNED NOT NULL,
            acertos SMALLINT UNSIGNED NOT NULL,
            aprovado TINYINT(1) NOT NULL DEFAULT 0,
            criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_tentativas_exercicio_usuario (usuario_id, exercicio_id, aprovado),
            CONSTRAINT fk_tentativa_exercicio_usuario FOREIGN KEY (usuario_id)
                REFERENCES usuarios (id) ON DELETE CASCADE,
            CONSTRAINT fk_tentativa_exercicio FOREIGN KEY (exercicio_id)
                REFERENCES exercicios_praticos (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log("Estrutura pronta para avaliações por módulo e exercícios executáveis.");
}

migrar()
    .catch((erro) => {
        console.error("Falha ao migrar as atividades interativas:", erro.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
