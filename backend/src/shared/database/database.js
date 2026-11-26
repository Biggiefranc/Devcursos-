const mysql = require("mysql2/promise");
const { opcoesTls } = require("./tls");
const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
    DB_SSL_CA
} = require("../../config/env");

const opcoesConexao = {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: DB_SSL ? opcoesTls(DB_HOST, DB_SSL_CA) : undefined
};

const pool = mysql.createPool({
    ...opcoesConexao,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 100,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

function criarConexao() {
    return mysql.createConnection(opcoesConexao);
}

async function testarConexao() {
    const conexao = await pool.getConnection();
    try {
        await conexao.execute("SELECT 1 AS conectado");
        console.log("Conexão com o banco de dados estabelecida com sucesso!");
    } finally {
        conexao.release();
    }
}

module.exports = { pool, criarConexao, testarConexao };
