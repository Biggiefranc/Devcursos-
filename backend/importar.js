const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const mysql = require("mysql2/promise");
require("./src/config/env");
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL, DB_SSL_CA } = require("./src/config/env");

function normalizarTecnologias(value) {
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    if (typeof value !== "string" || !value.trim()) return null;
    return value.split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
}

async function obterOuCriarCurso(db, dados) {
    const duracaoHoras = Number(dados.duracao_horas);
    const tecnologias = normalizarTecnologias(dados.tecnologias);
    const metadados = [
        Number.isFinite(duracaoHoras) && duracaoHoras > 0 ? duracaoHoras : null,
        tecnologias ? JSON.stringify(tecnologias) : null,
        String(dados.projeto_final || "").trim() || null
    ];
    const [existentes] = await db.execute(
        "SELECT id FROM cursos WHERE titulo = ? LIMIT 1",
        [dados.titulo]
    );
    if (existentes[0]) {
        await db.execute(
            "UPDATE cursos SET descricao = ?, categoria = ?, nivel = ?, duracao_horas = ?, tecnologias = ?, projeto_final = ? WHERE id = ?",
            [dados.descricao || null, dados.categoria || null, dados.nivel || "Iniciante", ...metadados, existentes[0].id]
        );
        return existentes[0].id;
    }
    const [resultado] = await db.execute(
        "INSERT INTO cursos (titulo, descricao, categoria, nivel, duracao_horas, tecnologias, projeto_final) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [dados.titulo, dados.descricao || null, dados.categoria || null, dados.nivel || "Iniciante", ...metadados]
    );
    return resultado.insertId;
}

async function obterOuCriarModulo(db, cursoId, dados) {
    const [existentes] = await db.execute(
        "SELECT id FROM modulos WHERE curso_id = ? AND titulo = ? LIMIT 1",
        [cursoId, dados.titulo]
    );
    if (existentes[0]) {
        await db.execute(
            "UPDATE modulos SET descricao = ?, ordem = ? WHERE id = ?",
            [dados.descricao || null, Number(dados.ordem) || 1, existentes[0].id]
        );
        return existentes[0].id;
    }
    const [resultado] = await db.execute(
        "INSERT INTO modulos (curso_id, titulo, descricao, ordem) VALUES (?, ?, ?, ?)",
        [cursoId, dados.titulo, dados.descricao || null, Number(dados.ordem) || 1]
    );
    return resultado.insertId;
}

async function importarCursos() {
    const db = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        ssl: DB_SSL ? {
            minVersion: "TLSv1.2",
            rejectUnauthorized: true,
            ...(DB_SSL_CA ? { ca: fs.readFileSync(DB_SSL_CA, "utf8") } : {})
        } : undefined
    });

    const pastaConteudo = path.join(__dirname, "conteudo");
    try {
        const pastasCursos = fs.readdirSync(pastaConteudo, { withFileTypes: true })
            .filter((item) => item.isDirectory())
            .map((item) => item.name)
            .sort();

        for (const pastaCurso of pastasCursos) {
            const caminhoCurso = path.join(pastaConteudo, pastaCurso);
            const arquivoCurso = path.join(caminhoCurso, "curso.md");
            if (!fs.existsSync(arquivoCurso)) {
                console.warn(`Ignorado ${pastaCurso}: arquivo curso.md ausente.`);
                continue;
            }

            await db.beginTransaction();
            try {
                const cursoFile = matter.read(arquivoCurso);
                if (!cursoFile.data.titulo) throw new Error(`${arquivoCurso}: campo titulo obrigatório.`);
                const cursoId = await obterOuCriarCurso(db, cursoFile.data);

                const pastasModulos = fs.readdirSync(caminhoCurso, { withFileTypes: true })
                    .filter((item) => item.isDirectory())
                    .map((item) => item.name)
                    .sort();

                for (const itemModulo of pastasModulos) {
                    const caminhoModulo = path.join(caminhoCurso, itemModulo);
                    const arquivoModulo = path.join(caminhoModulo, "modulo.md");
                    if (!fs.existsSync(arquivoModulo)) continue;
                    const moduloFile = matter.read(arquivoModulo);
                    if (!moduloFile.data.titulo) throw new Error(`${arquivoModulo}: campo titulo obrigatório.`);
                    const moduloId = await obterOuCriarModulo(db, cursoId, moduloFile.data);

                    const arquivosAulas = fs.readdirSync(caminhoModulo, { withFileTypes: true })
                        .filter((item) => item.isFile() && item.name.endsWith(".md") && item.name !== "modulo.md")
                        .map((item) => item.name)
                        .sort();

                    for (const arquivoAula of arquivosAulas) {
                        const aulaFile = matter.read(path.join(caminhoModulo, arquivoAula));
                        if (!aulaFile.data.titulo) throw new Error(`${arquivoAula}: campo titulo obrigatório.`);
                        const [existentes] = await db.execute(
                            "SELECT id FROM aulas WHERE modulo_id = ? AND titulo = ? LIMIT 1",
                            [moduloId, aulaFile.data.titulo]
                        );
                        const valores = [
                            aulaFile.data.descricao || null,
                            aulaFile.content,
                            aulaFile.data.video_url || null,
                            aulaFile.data.material_url || null,
                            Number.isInteger(Number(aulaFile.data.duracao)) && Number(aulaFile.data.duracao) > 0
                                ? Number(aulaFile.data.duracao)
                                : null,
                            Number(aulaFile.data.ordem) || 1
                        ];
                        if (existentes[0]) {
                            await db.execute(
                                "UPDATE aulas SET descricao = ?, conteudo = ?, video_url = ?, material_url = ?, duracao_minutos = ?, ordem = ? WHERE id = ?",
                                [...valores, existentes[0].id]
                            );
                        } else {
                            await db.execute(
                                "INSERT INTO aulas (modulo_id, titulo, descricao, conteudo, video_url, material_url, duracao_minutos, ordem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                                [moduloId, aulaFile.data.titulo, ...valores]
                            );
                        }
                    }
                }

                if (!(Number(cursoFile.data.duracao_horas) > 0)) {
                    const [[duration]] = await db.execute(
                        `SELECT SUM(a.duracao_minutos) AS minutos
                         FROM aulas a
                         INNER JOIN modulos m ON m.id = a.modulo_id
                         WHERE m.curso_id = ?`,
                        [cursoId]
                    );
                    if (duration.minutos != null) {
                        await db.execute(
                            "UPDATE cursos SET duracao_horas = ROUND(? / 60, 2) WHERE id = ?",
                            [Number(duration.minutos), cursoId]
                        );
                    }
                }
                await db.commit();
                console.log(`Curso sincronizado: ${cursoFile.data.titulo}`);
            } catch (erro) {
                await db.rollback();
                throw erro;
            }
        }
        console.log("Importação concluída sem duplicar cursos, módulos ou aulas existentes.");
    } finally {
        await db.end();
    }
}

importarCursos().catch((erro) => {
    console.error("Falha ao importar conteúdo:", erro.message);
    process.exitCode = 1;
});
