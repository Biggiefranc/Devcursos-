const app = require("./app");

const { PORT } = require("./config/env");
const { testarConexao } = require("./shared/database/database");

// Inicia o servidor HTTP.
const servidor = app.listen(PORT, () => {
    console.log(
        `Servidor do DevCursos+ rodando em http://localhost:${PORT}`
    );
});

// Verifica o banco sem impedir que a API inicie caso ele esteja indisponível.
testarConexao()
    .then(() => {
        console.log("Banco de dados disponível.");
    })
    .catch((erro) => {
        console.error(
            "Não foi possível conectar ao MySQL:",
            erro.message
        );
    });

// Trata erros de inicialização do servidor.
servidor.on("error", (erro) => {
    console.error("Erro ao iniciar o servidor:", erro.message);
});

