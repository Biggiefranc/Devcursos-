const express = require("express");
const cors = require("cors");
const { randomUUID } = require("node:crypto");

const usersRoutes = require("./modules/users/users.routes");
const cursosRoutes = require("./modules/courses/cursos.routes");
const progressRoutes = require("./modules/progress/progress.routes");
const favoritesRoutes = require("./modules/favorites/favorites.routes");
const assessmentsRoutes = require("./modules/assessments/assessments.routes");
const executionRoutes = require("./modules/execution/execution.routes");
const practiceRoutes = require("./modules/practice/practice.routes");

const { pool } = require("./shared/database/database");
const tratarErros = require("./shared/middlewares/tratarErros");

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  next();
});

const configuredFrontendOrigin = (() => {
  try {
    if (!process.env.FRONTEND_URL) return null;
    const url = new URL(process.env.FRONTEND_URL);
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
      throw new Error("FRONTEND_URL precisa usar HTTPS em produção.");
    }
    return url.origin;
  } catch {
    console.warn("FRONTEND_URL inválida; a origem configurada não será liberada pelo CORS.");
    return null;
  }
})();

if (process.env.NODE_ENV === "production" && !configuredFrontendOrigin) {
  throw new Error("Configure FRONTEND_URL com a origem HTTPS do frontend em produção.");
}

const allowedOrigins = new Set([
  configuredFrontendOrigin,
  ...(process.env.NODE_ENV === "production" ? [] : [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
  ])
].filter(Boolean));

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { protocol, hostname } = new URL(origin);
    const isLocalHost = process.env.NODE_ENV !== "production"
      && ["http:", "https:"].includes(protocol)
      && ["localhost", "127.0.0.1"].includes(hostname);
    return isLocalHost || allowedOrigins.has(origin);
  } catch {
    return false;
  }
};

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
    credentials: false,
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
    console.error("Falha na verificação do MySQL:", {
      requestId: req.id,
      codigo: erro.code || "ERRO_DE_BANCO"
    });

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
app.use(favoritesRoutes);
app.use(assessmentsRoutes);
app.use(practiceRoutes);
app.use(executionRoutes);

app.use((req, res) => {
  return res.status(404).json({
    mensagem: "Rota não encontrada.",
    codigo: "ROTA_NAO_ENCONTRADA"
  });
});

app.use(tratarErros);

module.exports = app;
