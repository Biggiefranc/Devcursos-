const mysql = require("mysql2/promise");
const {
    DB_HOST,
    DB_PORT,
    DB_USER, 
    DB_PASSWORD, 
    DB_NAME, 
    DB_SSL
} = require("../../config/env");

//const pool = mysql.createPool({
//    host: DB_HOST,
//    user: DB_USER,
//    password: DB_PASSWORD,
//    database: DB_NAME,
 //   waitForConnections: true,
 //   connectionLimit: 10,
 //   queueLimit: 0
//});

//const pool = mysql.createPool({
//    host: DB_HOST,
//    port: Number(process.env.DB_PORT || 4000),
//    user: DB_USER,
//    password: DB_PASSWORD,
//    database: DB_NAME,
//    ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
//    waitForConnections: true,
//    connectionLimit: 5,
//    queueLimit: 0
//});
const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,

    ssl: DB_SSL
        ? {
            minVersion: "TLSv1.2",
            rejectUnauthorized: true
        }
        : undefined,

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// Testa a conexão com o banco de dados
async function testarConexao() {
    const conexao = await pool.getConnection();

    try {
        await conexao.execute("SELECT 1 AS conectado");
        console.log("Conexão com o banco de dados estabelecida com sucesso!");
    } finally {
        conexao.release(); // Encerrar a conexão após o teste
    }
}

// Testa a conexão ao iniciar a aplicação
module.exports = {
    pool,
    testarConexao
};