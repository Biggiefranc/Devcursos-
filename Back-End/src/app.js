const express = require("express");
const cors = require("cors");

const usersRoutes = require("./modules/users/users.routes");
const cursosRoutes = require("./modules/courses/cursos.routes");

const { pool } = require("./shared/database/database");
const tratarErros = require("./shared/middlewares/tratarErros");

const app = express();

// Middlewares globais.
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Rota principal.
app.get("/", (req, res) => {
    res.send("Backend do DevCursos+ funcionando!");
});

// Verifica a disponibilidade do MySQL.
app.get("/health", async (req, res) => {
    try {
        await pool.execute("SELECT 1 AS conectado");

        return res.status(200).json({
            status: "ok",
            banco: "conectado",
            mensagem: "API e MySQL funcionando."
        });
    } catch (erro) {
        console.error("Falha na verificação do MySQL:", erro.message);

        return res.status(503).json({
            status: "erro",
            banco: "desconectado",
            mensagem: "A API está ativa, mas não conseguiu consultar o MySQL."
        });
    }
});

// Rotas dos módulos.
app.use(usersRoutes);
app.use(cursosRoutes);

// Rota para endereços inexistentes.
app.use((req, res) => {
    return res.status(404).json({
        mensagem: "Rota não encontrada."
    });
});

// Middleware centralizado de erros (deve ficar por último).
app.use(tratarErros);

module.exports = app;