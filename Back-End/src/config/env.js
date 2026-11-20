
const path = require("node:path");
require("./loadEnv");

function lerBooleano(nome, valorPadrao) {
    const valor = process.env[nome];
    if (valor === undefined || valor === "") return valorPadrao;

    const normalizado = valor.trim().toLowerCase();
    if (normalizado === "true") return true;
    if (normalizado === "false") return false;

    throw new Error(`${nome} precisa ser 'true' ou 'false'.`);
}

// Porta do servidor modular (padrão: 3001).
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);

// Configurações do MySQL.
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
const DB_NAME = process.env.DB_NAME;
const DB_SSL = lerBooleano("DB_SSL", false);
const DB_SSL_CA = process.env.DB_SSL_CA ? path.resolve(process.env.DB_SSL_CA) : null;

// Valida as configurações obrigatórias.
if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error(
        "Configure DB_HOST, DB_USER e DB_NAME no arquivo .env"
    );
}

const hostsLocais = new Set(["localhost", "127.0.0.1", "::1"]);
const bancoRemotoEmProducao = process.env.NODE_ENV === "production"
    && !hostsLocais.has(DB_HOST.trim().toLowerCase());

if (bancoRemotoEmProducao && !DB_SSL) {
    throw new Error("DB_SSL=true é obrigatório para conectar a um banco remoto em produção.");
}

if (process.env.NODE_ENV === "production" && !DB_PASSWORD) {
    throw new Error("DB_PASSWORD é obrigatório em produção.");
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("PORT precisa ser uma porta válida.");
}

if (!Number.isInteger(DB_PORT) || DB_PORT < 1 || DB_PORT > 65535) {
    throw new Error("DB_PORT precisa ser uma porta válida.");
}

module.exports = {
    PORT,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
    DB_SSL_CA
};
