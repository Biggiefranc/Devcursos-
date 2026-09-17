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


// =========================
// CONEXÃO COM MYSQL
// =========================

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "2009",
    database: "dev_cursos"
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

                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });

        }
    );

});

// =========================
// Servidor

app.listen(3000, () => {

    console.log(
        "Servidor rodando em http://localhost:3000"
    );

});