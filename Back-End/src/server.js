const app = require("./app");
const { PORT } = require("./config/env");
const { pool, testarConexao } = require("./shared/database/database");

async function startServer() {
    try {
        await testarConexao();
        console.log("Banco de dados disponível.");
    } catch (erro) {
        console.error("Não foi possível conectar ao MySQL:", erro.message);
        if (process.env.NODE_ENV === "production") {
            console.error("Servidor não iniciado: banco de dados obrigatório em produção.");
            await pool.end().catch(() => {});
            process.exitCode = 1;
            return;
        }
        console.warn("Modo de desenvolvimento: a API iniciará, mas rotas que usam o banco falharão até a conexão ser restabelecida.");
    }

    const servidor = app.listen(PORT, () => {
        console.log(`Servidor do DevCursos+ rodando em http://localhost:${PORT}`);
    });

    servidor.on("error", (erro) => {
        console.error("Erro ao iniciar o servidor:", erro.message);
        process.exitCode = 1;
    });
}

startServer();
