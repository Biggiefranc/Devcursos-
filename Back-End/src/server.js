const app = require("./app");

const { PORT } = require("./config/env");
const { testarConexao } = require("./shared/database/database");

const startServer = async () => {
    try {
        await testarConexao();
        console.log("Banco de dados disponível.");
    } catch (erro) {
        console.error("Não foi possível conectar ao MySQL:", erro.message);
    }

    const servidor = app.listen(PORT, () => {
        console.log(`Servidor do DevCursos+ rodando em http://localhost:${PORT}`);
    });

    servidor.on("error", (erro) => {
        console.error("Erro ao iniciar o servidor:", erro.message);
        process.exitCode = 1;
    });
};

startServer();

