const path = require("node:path");
const dotenv = require("dotenv");

// Todos os módulos carregam a mesma configuração, sempre a partir de Back-End/.env.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
