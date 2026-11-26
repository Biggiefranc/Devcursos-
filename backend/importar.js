const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const { criarConexao } = require("./src/shared/database/database");

const indiceFiltroCurso = process.argv.indexOf("--curso");
const filtroCurso = indiceFiltroCurso >= 0 ? process.argv[indiceFiltroCurso + 1] : null;
if (indiceFiltroCurso >= 0 && !filtroCurso) {
    throw new Error("Uso: node importar.js [--curso \"Título do curso\"]");
}

function normalizarTecnologias(value) {
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    if (typeof value !== "string" || !value.trim()) return null;
    return value.split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
}

function validarExercicio(arquivo, exercicio) {
    const avaliador = exercicio?.avaliador;
    if (!exercicio?.titulo || !exercicio?.enunciado || typeof exercicio.codigo_inicial !== "string") {
        throw new Error(`${arquivo}: exercício precisa de título, enunciado e codigo_inicial.`);
    }
    if (typeof exercicio.correcao !== "string" || !exercicio.correcao.trim()) {
        throw new Error(`${arquivo}: informe o código da correção comentada.`);
    }
    if (!avaliador || !["saida", "funcao"].includes(avaliador.tipo)
        || !Array.isArray(avaliador.casos) || avaliador.casos.length === 0 || avaliador.casos.length > 16) {
        throw new Error(`${arquivo}: avaliador precisa ter tipo saida/funcao e casos de verificação.`);
    }
    if (avaliador.tipo === "funcao" && !avaliador.nome_funcao) {
        throw new Error(`${arquivo}: informe nome_funcao no avaliador do tipo funcao.`);
    }
    for (const [indice, caso] of avaliador.casos.entries()) {
        if (avaliador.tipo === "saida"
            && (!Array.isArray(caso.entradas) || typeof caso.saida_esperada !== "string")) {
            throw new Error(`${arquivo}: caso de saída ${indice + 1} precisa de entradas e saida_esperada.`);
        }
        if (avaliador.tipo === "funcao"
            && (!Array.isArray(caso.argumentos) || !Object.hasOwn(caso, "resultado_esperado"))) {
            throw new Error(`${arquivo}: caso de função ${indice + 1} precisa de argumentos e resultado_esperado.`);
        }
    }
}

async function obterOuCriarCurso(db, dados) {
    const duracaoHoras = Number(dados.duracao_horas);
    const tecnologias = normalizarTecnologias(dados.tecnologias);
    const linguagem = dados.linguagem ?? null;
    if (linguagem !== null && !["python", "java"].includes(linguagem)) {
        throw new Error("Use python ou java no campo linguagem do curso.");
    }
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
            "UPDATE cursos SET descricao = ?, categoria = ?, nivel = ?, duracao_horas = ?, tecnologias = ?, projeto_final = ?, linguagem = COALESCE(?, linguagem) WHERE id = ?",
            [dados.descricao || null, dados.categoria || null, dados.nivel || "Iniciante", ...metadados, linguagem, existentes[0].id]
        );
        return existentes[0].id;
    }
    const [resultado] = await db.execute(
        "INSERT INTO cursos (titulo, descricao, categoria, nivel, duracao_horas, tecnologias, projeto_final, linguagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [dados.titulo, dados.descricao || null, dados.categoria || null, dados.nivel || "Iniciante", ...metadados, linguagem]
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
    const db = await criarConexao();

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

            const cursoFile = matter.read(arquivoCurso);
            if (!cursoFile.data.titulo) throw new Error(`${arquivoCurso}: campo titulo obrigatório.`);
            if (filtroCurso && cursoFile.data.titulo !== filtroCurso) continue;

            await db.beginTransaction();
            try {
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
                    const arquivoExercicios = path.join(caminhoModulo, "exercicios.json");
                    const definicoesExercicios = fs.existsSync(arquivoExercicios)
                        ? JSON.parse(fs.readFileSync(arquivoExercicios, "utf8"))
                        : {};

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
                        let aulaId;
                        if (existentes[0]) {
                            aulaId = existentes[0].id;
                            await db.execute(
                                "UPDATE aulas SET descricao = ?, conteudo = ?, video_url = ?, material_url = ?, duracao_minutos = ?, ordem = ? WHERE id = ?",
                                [...valores, existentes[0].id]
                            );
                        } else {
                            const [resultado] = await db.execute(
                                "INSERT INTO aulas (modulo_id, titulo, descricao, conteudo, video_url, material_url, duracao_minutos, ordem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                                [moduloId, aulaFile.data.titulo, ...valores]
                            );
                            aulaId = resultado.insertId;
                        }

                        const exercicio = definicoesExercicios.aulas?.[arquivoAula];
                        const tipo = aulaFile.data.tipo;
                        const exigeExercicio = tipo === "pratica"
                            || (cursoFile.data.editor_interativo && tipo !== "teoria");
                        if (exigeExercicio && !exercicio) {
                            throw new Error(`${arquivoExercicios}: falta exercício interativo para ${arquivoAula}.`);
                        }
                        if (tipo === "teoria" && exercicio) {
                            throw new Error(`${arquivoExercicios}: ${arquivoAula} está marcada como teoria e possui um exercício.`);
                        }
                        if (exercicio) {
                            validarExercicio(`${arquivoExercicios} → ${arquivoAula}`, exercicio);
                            await db.execute(
                                `INSERT INTO exercicios_praticos
                                    (aula_id, titulo, enunciado, codigo_inicial, avaliador_json)
                                 VALUES (?, ?, ?, ?, ?)
                                 ON DUPLICATE KEY UPDATE
                                    titulo = VALUES(titulo),
                                    enunciado = VALUES(enunciado),
                                    codigo_inicial = VALUES(codigo_inicial),
                                    avaliador_json = VALUES(avaliador_json)`,
                                [aulaId, exercicio.titulo, exercicio.enunciado, exercicio.codigo_inicial,
                                    JSON.stringify({ ...exercicio.avaliador, correcao: exercicio.correcao })]
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
