
const path = require("path");

// Carrega o .env localizado na raiz do Back-End.
require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});

// Porta do servidor modular (padrão: 3000).
const PORT = Number(process.env.API_PORT || 3000);

// Configurações do MySQL.
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
const DB_NAME = process.env.DB_NAME;

// Valida as configurações obrigatórias.
if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error(
        "Configure DB_HOST, DB_USER e DB_NAME no arquivo .env"
    );
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("API_PORT precisa ser uma porta válida.");
}

module.exports = {
    PORT,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
};
