const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const mysql = require("mysql2/promise");
require("../src/config/env");
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL, DB_SSL_CA } = require("../src/config/env");

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

async function importarArquivo(db, caminhoCurso) {
    const arquivoCurso = path.join(caminhoCurso, "curso.md");
    const arquivoAvaliacao = path.join(caminhoCurso, "avaliacao.json");
    if (!fs.existsSync(arquivoCurso) || !fs.existsSync(arquivoAvaliacao)) return false;

    const curso = matter.read(arquivoCurso).data;
    const avaliacao = JSON.parse(fs.readFileSync(arquivoAvaliacao, "utf8"));
    validarAvaliacao(arquivoAvaliacao, avaliacao);

    await db.beginTransaction();
    try {
        const [cursos] = await db.execute(
            "SELECT id FROM cursos WHERE titulo = ? LIMIT 1 FOR UPDATE",
            [curso.titulo],
        );
        if (!cursos[0]) throw new Error(`Curso não encontrado no banco: ${curso.titulo}`);
        const cursoId = cursos[0].id;
        const [avaliacoes] = await db.execute(
            "SELECT id FROM avaliacoes WHERE curso_id = ? LIMIT 1 FOR UPDATE",
            [cursoId],
        );

        let avaliacaoId;
        if (avaliacoes[0]) {
            avaliacaoId = avaliacoes[0].id;
            const [[tentativas]] = await db.execute(
                "SELECT COUNT(*) AS total FROM tentativas_avaliacao WHERE avaliacao_id = ?",
                [avaliacaoId],
            );
            if (Number(tentativas.total) > 0) {
                await db.commit();
                console.log(`Avaliacao preservada (${tentativas.total} tentativa(s) registrada(s)): ${curso.titulo}`);
                return true;
            }
            await db.execute(
                "UPDATE avaliacoes SET titulo = ?, minimo_acertos = ?, ativa = ? WHERE id = ?",
                [avaliacao.titulo, avaliacao.minimo_acertos, avaliacao.ativa === false ? 0 : 1, avaliacaoId],
            );
            await db.execute("DELETE FROM questoes_avaliacao WHERE avaliacao_id = ?", [avaliacaoId]);
        } else {
            const [resultado] = await db.execute(
                "INSERT INTO avaliacoes (curso_id, titulo, minimo_acertos, ativa) VALUES (?, ?, ?, ?)",
                [cursoId, avaliacao.titulo, avaliacao.minimo_acertos, avaliacao.ativa === false ? 0 : 1],
            );
            avaliacaoId = resultado.insertId;
        }

        for (const [indiceQuestao, questao] of avaliacao.questoes.entries()) {
            const [resultadoQuestao] = await db.execute(
                "INSERT INTO questoes_avaliacao (avaliacao_id, enunciado, ordem) VALUES (?, ?, ?)",
                [avaliacaoId, questao.enunciado, indiceQuestao + 1],
            );
            const questaoId = resultadoQuestao.insertId;
            for (const [indiceAlternativa, alternativa] of questao.alternativas.entries()) {
                await db.execute(
                    "INSERT INTO alternativas_avaliacao (questao_id, texto, correta, ordem) VALUES (?, ?, ?, ?)",
                    [questaoId, alternativa.texto, alternativa.correta ? 1 : 0, indiceAlternativa + 1],
                );
            }
        }

        await db.commit();
        console.log(`Avaliacao sincronizada: ${curso.titulo} (${avaliacao.questoes.length} questoes)`);
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
        for (const entrada of fs.readdirSync(raiz, { withFileTypes: true })) {
            if (entrada.isDirectory()) await importarArquivo(db, path.join(raiz, entrada.name));
        }
    } finally {
        await db.end();
    }
}

importarAvaliacoes().catch((erro) => {
    console.error("Falha ao importar avaliações:", erro.message);
    process.exitCode = 1;
});
