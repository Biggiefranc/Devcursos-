const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const mysql = require("mysql2/promise");
require("../src/config/env");
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL, DB_SSL_CA } = require("../src/config/env");

const indiceFiltroCurso = process.argv.indexOf("--curso");
const filtroCurso = indiceFiltroCurso >= 0 ? process.argv[indiceFiltroCurso + 1] : null;
if (indiceFiltroCurso >= 0 && !filtroCurso) {
    throw new Error("Uso: node scripts/importar-avaliacoes.js [--curso \"Título do curso\"]");
}

function validarAvaliacao(arquivo, dados) {
    if (!dados.titulo || !Array.isArray(dados.questoes) || dados.questoes.length === 0) {
        throw new Error(`${arquivo}: informe titulo e uma lista não vazia de questoes.`);
    }
    if (!Number.isInteger(dados.minimo_acertos) || dados.minimo_acertos < 1 || dados.minimo_acertos > dados.questoes.length) {
        throw new Error(`${arquivo}: minimo_acertos precisa ficar entre 1 e o total de questoes.`);
    }
    dados.questoes.forEach((questao, indice) => {
        if (!questao.enunciado || !Array.isArray(questao.alternativas) || questao.alternativas.length < 2) {
            throw new Error(`${arquivo}: questão ${indice + 1} precisa de enunciado e pelo menos duas alternativas.`);
        }
        if (questao.alternativas.filter((alternativa) => alternativa.correta === true).length !== 1) {
            throw new Error(`${arquivo}: questão ${indice + 1} precisa ter exatamente uma alternativa correta.`);
        }
        if (questao.alternativas.some((alternativa) => !alternativa.texto)) {
            throw new Error(`${arquivo}: questão ${indice + 1} possui alternativa sem texto.`);
        }
    });
}

async function importarAvaliacao(db, { curso, cursoId, caminhoCurso, caminhoModulo = null }) {
    const arquivoAvaliacao = path.join(caminhoModulo || caminhoCurso, "avaliacao.json");
    if (!fs.existsSync(arquivoAvaliacao)) return false;

    let moduloId = null;
    let moduloTitulo = null;
    if (caminhoModulo) {
        const arquivoModulo = path.join(caminhoModulo, "modulo.md");
        if (!fs.existsSync(arquivoModulo)) return false;
        const modulo = matter.read(arquivoModulo).data;
        moduloTitulo = modulo.titulo;
        const [modulos] = await db.execute(
            "SELECT id FROM modulos WHERE curso_id = ? AND titulo = ? LIMIT 1",
            [cursoId, moduloTitulo],
        );
        if (!modulos[0]) throw new Error(`Módulo não encontrado no banco: ${moduloTitulo}`);
        moduloId = Number(modulos[0].id);
    }

    const avaliacao = JSON.parse(fs.readFileSync(arquivoAvaliacao, "utf8"));
    validarAvaliacao(arquivoAvaliacao, avaliacao);
    await db.beginTransaction();
    try {
        const [existentes] = await db.execute(
            moduloId == null
                ? "SELECT id FROM avaliacoes WHERE curso_id = ? AND modulo_id IS NULL LIMIT 1 FOR UPDATE"
                : "SELECT id FROM avaliacoes WHERE modulo_id = ? LIMIT 1 FOR UPDATE",
            [moduloId == null ? cursoId : moduloId],
        );

        let avaliacaoId;
        if (existentes[0]) {
            avaliacaoId = Number(existentes[0].id);
            const [[tentativas]] = await db.execute(
                "SELECT COUNT(*) AS total FROM tentativas_avaliacao WHERE avaliacao_id = ?",
                [avaliacaoId],
            );
            if (Number(tentativas.total) > 0) {
                await db.commit();
                console.log(`Avaliação preservada (${tentativas.total} tentativa(s)): ${curso.titulo} / ${moduloTitulo || "final"}`);
                return true;
            }
            await db.execute(
                `UPDATE avaliacoes
                 SET curso_id = ?, modulo_id = ?, titulo = ?, minimo_acertos = ?, ativa = ?
                 WHERE id = ?`,
                [moduloId == null ? cursoId : null, moduloId, avaliacao.titulo, avaliacao.minimo_acertos, avaliacao.ativa === false ? 0 : 1, avaliacaoId],
            );
            await db.execute("DELETE FROM questoes_avaliacao WHERE avaliacao_id = ?", [avaliacaoId]);
        } else {
            const [resultado] = await db.execute(
                `INSERT INTO avaliacoes
                    (curso_id, modulo_id, titulo, minimo_acertos, ativa)
                 VALUES (?, ?, ?, ?, ?)`,
                [moduloId == null ? cursoId : null, moduloId, avaliacao.titulo, avaliacao.minimo_acertos, avaliacao.ativa === false ? 0 : 1],
            );
            avaliacaoId = Number(resultado.insertId);
        }

        for (const [indiceQuestao, questao] of avaliacao.questoes.entries()) {
            const [resultadoQuestao] = await db.execute(
                "INSERT INTO questoes_avaliacao (avaliacao_id, enunciado, ordem) VALUES (?, ?, ?)",
                [avaliacaoId, questao.enunciado, indiceQuestao + 1],
            );
            for (const [indiceAlternativa, alternativa] of questao.alternativas.entries()) {
                await db.execute(
                    "INSERT INTO alternativas_avaliacao (questao_id, texto, correta, ordem) VALUES (?, ?, ?, ?)",
                    [resultadoQuestao.insertId, alternativa.texto, alternativa.correta ? 1 : 0, indiceAlternativa + 1],
                );
            }
        }

        await db.commit();
        console.log(`Avaliação sincronizada: ${curso.titulo} / ${moduloTitulo || "final"} (${avaliacao.questoes.length} questões)`);
        return true;
    } catch (erro) {
        await db.rollback();
        throw erro;
    }
}

async function importarAvaliacoes() {
    const db = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        ssl: DB_SSL ? {
            minVersion: "TLSv1.2",
            rejectUnauthorized: true,
            ...(DB_SSL_CA ? { ca: fs.readFileSync(DB_SSL_CA, "utf8") } : {}),
        } : undefined,
    });

    try {
        const raiz = path.join(__dirname, "..", "conteudo");
        let encontradas = 0;
        for (const entrada of fs.readdirSync(raiz, { withFileTypes: true })) {
            if (!entrada.isDirectory()) continue;
            const caminhoCurso = path.join(raiz, entrada.name);
            const arquivoCurso = path.join(caminhoCurso, "curso.md");
            if (!fs.existsSync(arquivoCurso)) continue;
            const curso = matter.read(arquivoCurso).data;
            if (filtroCurso && curso.titulo !== filtroCurso) continue;
            const [cursos] = await db.execute(
                "SELECT id FROM cursos WHERE titulo = ? LIMIT 1",
                [curso.titulo],
            );
            if (!cursos[0]) throw new Error(`Curso não encontrado no banco: ${curso.titulo}`);
            const cursoId = Number(cursos[0].id);

            if (await importarAvaliacao(db, { curso, cursoId, caminhoCurso })) encontradas += 1;
            for (const modulo of fs.readdirSync(caminhoCurso, { withFileTypes: true })) {
                if (!modulo.isDirectory()) continue;
                if (await importarAvaliacao(db, {
                    curso,
                    cursoId,
                    caminhoCurso,
                    caminhoModulo: path.join(caminhoCurso, modulo.name),
                })) encontradas += 1;
            }
        }
        if (filtroCurso && encontradas === 0) {
            throw new Error(`Nenhuma avaliação encontrada para o curso: ${filtroCurso}`);
        }
    } finally {
        await db.end();
    }
}

importarAvaliacoes().catch((erro) => {
    console.error("Falha ao importar avaliações:", erro.message);
    process.exitCode = 1;
});
