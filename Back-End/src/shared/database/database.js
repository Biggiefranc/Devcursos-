const fs = require("node:fs");
const mysql = require("mysql2/promise");
const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
    DB_SSL_CA
} = require("../../config/env");

const ssl = DB_SSL
    ? {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
        ...(DB_SSL_CA ? { ca: fs.readFileSync(DB_SSL_CA, "utf8") } : {})
    }
    : undefined;

const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

async function testarConexao() {
    const conexao = await pool.getConnection();
    try {
        await conexao.execute("SELECT 1 AS conectado");
        console.log("Conexão com o banco de dados estabelecida com sucesso!");
    } finally {
        conexao.release();
    }
}

module.exports = { pool, testarConexao };
