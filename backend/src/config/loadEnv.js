const path = require("node:path");
const dotenv = require("dotenv");

// Todos os módulos carregam a configuração de backend/.env pelo mesmo caminho.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
