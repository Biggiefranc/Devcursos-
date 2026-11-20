const mysql = require("mysql2/promise");

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    console.log("Conectado ao TiDB!");

    await connection.query("CREATE DATABASE IF NOT EXISTS dev_cursos");

    const [rows] = await connection.query("SHOW DATABASES");
    console.log("Bancos disponíveis:", rows.map(row => row.Database));
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error("Falha na conexão:", error.message);
  process.exit(1);
});