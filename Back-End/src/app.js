// ...existing code...
const express = require("express");
const cors = require("cors");

const usersRoutes = require("./modules/users/users.routes");
const cursosRoutes = require("./modules/courses/cursos.routes");
const progressRoutes = require("./modules/progress/progress.routes");

const { pool } = require("./shared/database/database");
const tratarErros = require("./shared/middlewares/tratarErros");

const app = express();

const allowedOrigins = new Set([
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL
].filter(Boolean));

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { protocol, hostname } = new URL(origin);
    const isLocalHost = ["http:", "https:"].includes(protocol) && ["localhost", "127.0.0.1"].includes(hostname);
    return isLocalHost || allowedOrigins.has(origin);
  } catch {
    return false;
  }
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (req.method === "OPTIONS") {
    if (origin && isAllowedOrigin(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }

  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      console.warn("CORS bloqueado para:", origin);
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("Backend do DevCursos+ funcionando!");
});

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

app.use(usersRoutes);
app.use(cursosRoutes);
app.use(progressRoutes);

app.use((req, res) => {
  return res.status(404).json({
    mensagem: "Rota não encontrada."
  });
});

app.use(tratarErros);

module.exports = app;
// ...existing code...