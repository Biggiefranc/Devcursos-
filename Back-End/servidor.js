require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();


// =========================
// CONFIGURAÇÕES
// =========================

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Configure JWT_SECRET no arquivo .env");
}

function criarToken(usuario) {
    const payload = Buffer.from(JSON.stringify({
        id: usuario.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    })).toString("base64url");

    const assinatura = crypto
        .createHmac("sha256", JWT_SECRET)
        .update(payload)
        .digest("base64url");

    return `${payload}.${assinatura}`;
}

function autenticar(req, res, next) {
    const cabecalho = req.headers.authorization || "";
    const token = cabecalho.startsWith("Bearer ")
        ? cabecalho.slice(7)
        : "";

    const partes = token.split(".");

    if (partes.length !== 2) {
        return res.status(401).json({
            mensagem: "Autenticação necessária."
        });
    }

    const [payload, assinatura] = partes;

    const assinaturaEsperada = crypto
        .createHmac("sha256", JWT_SECRET)
        .update(payload)
        .digest();

    let assinaturaRecebida;

    try {
        assinaturaRecebida = Buffer.from(assinatura, "base64url");
    } catch {
        return res.status(401).json({
            mensagem: "Token inválido."
        });
    }

    if (
        assinaturaRecebida.length !== assinaturaEsperada.length ||
        !crypto.timingSafeEqual(assinaturaRecebida, assinaturaEsperada)
    ) {
        return res.status(401).json({
            mensagem: "Token inválido."
        });
    }

    let dados;

    try {
        dados = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8")
        );
    } catch {
        return res.status(401).json({
            mensagem: "Token inválido."
        });
    }

    if (
        !Number.isInteger(dados.id) ||
        !Number.isInteger(dados.exp) ||
        dados.exp <= Math.floor(Date.now() / 1000)
    ) {
        return res.status(401).json({
            mensagem: "Token expirado ou inválido."
        });
    }

    req.usuarioId = dados.id;
    next();
}

// =========================
// CONEXÃO COM MYSQL
// =========================

const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

conexao.connect((erro) => {

    if (erro) {
        console.error("Erro ao conectar ao MySQL:");
        console.error(erro.message);
        return;
    }

    console.log("MySQL conectado com sucesso!");
});


// =========================
// ROTA PRINCIPAL
// =========================

app.get("/", (req, res) => {
    res.send("Backend da DevCursos+ funcionando!");
});

// =========================
// VERIFICAR ESTADO DA API E DO MYSQL
// =========================

app.get("/health", (req, res) => {
    conexao.query("SELECT 1 AS conectado", (erro) => {
        if (erro) {
            console.error("Falha na verificação do MySQL:", erro.message);

            return res.status(503).json({
                status: "erro",
                banco: "desconectado",
                mensagem: "A API está ativa, mas não conseguiu consultar o MySQL."
            });
        }

        return res.status(200).json({
            status: "ok",
            banco: "conectado",
            mensagem: "API e MySQL funcionando."
        });
    });
});

// =========================
// CADASTRO
// =========================

app.post("/cadastro", async (req, res) => {

    const { nome, email, senha } = req.body;

    // Verifica se todos os campos foram enviados
    if (!nome || !email || !senha) {
        return res.status(400).json({
            mensagem: "Preencha todos os campos."
        });
    }

    try {

        // Cria o hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO usuarios (nome, email, senha)
            VALUES (?, ?, ?)
        `;

        conexao.query(
            sql,
            [nome, email, senhaHash],
            (erro, resultado) => {

                if (erro) {

                    // E-mail já cadastrado
                    if (erro.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            mensagem: "Este e-mail já está cadastrado."
                        });
                    }

                    console.error(erro);

                    return res.status(500).json({
                        mensagem: "Erro ao cadastrar usuário."
                    });
                }

                res.status(201).json({
                    mensagem: "Usuário cadastrado com sucesso!"
                });
            }
        );

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao processar a senha."
        });
    }
});


// =========================
// LOGIN
// =========================

app.post("/login", async (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) {

        return res.status(400).json({
            mensagem: "Preencha o e-mail e a senha."
        });

    }


    const sql = `
        SELECT * FROM usuarios
        WHERE email = ?
    `;


    conexao.query(
        sql,
        [email],
        async (erro, resultados) => {

            if (erro) {

                console.error(erro);

                return res.status(500).json({
                    mensagem: "Erro ao consultar o banco de dados."
                });

            }


            if (resultados.length === 0) {

                return res.status(401).json({
                    mensagem: "E-mail ou senha incorretos."
                });

            }


            const usuario = resultados[0];


            const senhaCorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );


            if (!senhaCorreta) {

                return res.status(401).json({
                    mensagem: "E-mail ou senha incorretos."
                });

            }


            res.json({
                mensagem: "Login realizado com sucesso!",
                token: criarToken(usuario),
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });

        }
    );

});

app.get("/me", autenticar, (req, res) => {
    conexao.query(
        "SELECT id, nome, email FROM usuarios WHERE id = ?",
        [req.usuarioId],
        (erro, resultados) => {
            if (erro) {
                console.error(erro);
                return res.status(500).json({
                    mensagem: "Erro ao verificar a sessão."
                });
            }

            if (resultados.length === 0) {
                return res.status(401).json({
                    mensagem: "Usuário não encontrado."
                });
            }

            res.json({ usuario: resultados[0] });
        }
    );
});

// =========================
// CURSOS
// =========================

app.get("/cursos", (req, res) => {

    const sql = "SELECT * FROM cursos";

    conexao.query(sql, (erro, resultados) => {

        if (erro) {

            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao consultar o banco de dados."
            });

        }

        res.json(resultados);

    });

});


// =========================
// BUSCAR CURSO POR ID
// =========================

app.get("/cursos/:id", (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id,
            titulo,
            descricao,
            categoria,
            nivel,
            data_criacao
        FROM cursos
        WHERE id = ?
    `;

    conexao.query(
        sql,
        [id],
        (erro, resultados) => {

            if (erro) {

                console.error(erro);

                return res.status(500).json({
                    mensagem: "Erro ao consultar o curso."
                });

            }

            if (resultados.length === 0) {

                return res.status(404).json({
                    mensagem: "Curso não encontrado."
                });

            }

            res.json(resultados[0]);

        }
    );

});

// =========================
// LISTAR MÓDULOS DE UM CURSO
// =========================

app.get("/cursos/:id/modulos", (req, res) => {

    const cursoId = Number(req.params.id);

    // Verifica se o ID é válido
    if (!Number.isInteger(cursoId) || cursoId <= 0) {
        return res.status(400).json({
            mensagem: "ID do curso inválido."
        });
    }

    // Verifica se o curso existe
    const sqlCurso = `
        SELECT id
        FROM cursos
        WHERE id = ?
    `;

    conexao.query(sqlCurso, [cursoId], (erro, cursos) => {

        if (erro) {
            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao consultar o curso."
            });
        }

        if (cursos.length === 0) {
            return res.status(404).json({
                mensagem: "Curso não encontrado."
            });
        }

        // Busca os módulos vinculados ao curso
        const sqlModulos = `
            SELECT
                id,
                curso_id,
                titulo,
                descricao,
                ordem
            FROM modulos
            WHERE curso_id = ?
            ORDER BY ordem ASC, id ASC
        `;

        conexao.query(
            sqlModulos,
            [cursoId],
            (erro, modulos) => {

                if (erro) {
                    console.error(erro);

                    return res.status(500).json({
                        mensagem: "Erro ao consultar os módulos."
                    });
                }

                res.json(modulos);
            }
        );
    });
});

// =========================
// LISTAR AULAS DE UM MÓDULO
// =========================

app.get("/modulos/:id/aulas", (req, res) => {

    const moduloId = Number(req.params.id);

    // Valida o ID do módulo
    if (!Number.isInteger(moduloId) || moduloId <= 0) {
        return res.status(400).json({
            mensagem: "ID do módulo inválido."
        });
    }

    // Verifica se o módulo existe
    const sqlModulo = `
        SELECT id
        FROM modulos
        WHERE id = ?
    `;

    conexao.query(sqlModulo, [moduloId], (erro, modulos) => {

        if (erro) {
            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao consultar o módulo."
            });
        }

        if (modulos.length === 0) {
            return res.status(404).json({
                mensagem: "Módulo não encontrado."
            });
        }

        // Busca as aulas do módulo
        const sqlAulas = `
            SELECT
                id,
                modulo_id,
                titulo,
                descricao,
                ordem
            FROM aulas
            WHERE modulo_id = ?
            ORDER BY ordem ASC, id ASC
        `;

        conexao.query(sqlAulas, [moduloId], (erro, aulas) => {

            if (erro) {
                console.error(erro);

                return res.status(500).json({
                    mensagem: "Erro ao consultar as aulas."
                });
            }

            res.json(aulas);

        });

    });

});

// =========================
// BUSCAR AULA COMPLETA POR ID
// =========================

app.get("/aulas/:id", (req, res) => {

    const aulaId = Number(req.params.id);

    // Valida o ID da aula
    if (!Number.isInteger(aulaId) || aulaId <= 0) {
        return res.status(400).json({
            mensagem: "ID da aula inválido."
        });
    }

    const sql = `
        SELECT
            id,
            modulo_id,
            titulo,
            descricao,
            conteudo,
            video_url,
            material_url,
            ordem
        FROM aulas
        WHERE id = ?
    `;

    conexao.query(sql, [aulaId], (erro, resultados) => {

        if (erro) {
            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao consultar a aula."
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensagem: "Aula não encontrada."
            });
        }

        res.json(resultados[0]);

    });

});



// =========================
// SERVIDOR
// =========================

app.listen(3000, () => {

    console.log(
        "Servidor rodando em http://localhost:3000"
    );

});