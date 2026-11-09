const express = require("express");
const cors = require("cors");

const usersRoutes = require("./modules/users/users.routes");
const cursosRoutes = require("./modules/courses/cursos.routes");
const progressRoutes = require("./modules/progress/progress.routes");

const { pool } = require("./shared/database/database");
const tratarErros = require("./shared/middlewares/tratarErros");

const app = express();

//

const origensPermitidas = [
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Middlewares globais.


app.use(cors({
    origin(origem, callback) {
        // Permite ferramentas locais sem Origin (curl/Postman).
        if (!origem || origensPermitidas.includes(origem)) {
            //return callback(null, true);
            callback(null, true);
            return;
        }
        console.log('Tentativa de acesso de origem não autorizada:', origem);
        callback(new Error("Origem não autorizada pelo CORS."));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors({
  origin: (origem, callback) => {
    if (!origem || origensPermitidas.includes(origem)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origem não autorizada pelo CORS'));
  },
  credentials: true
}));

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
app.use(progressRoutes);

// Rota para endereços inexistentes.
app.use((req, res) => {
    return res.status(404).json({
        mensagem: "Rota não encontrada."
    });
});

// Middleware centralizado de erros (deve ficar por último).
app.use(tratarErros);

module.exports = app;