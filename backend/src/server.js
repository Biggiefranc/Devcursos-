const app = require("./app");
const { PORT } = require("./config/env");
const { pool, testarConexao } = require("./shared/database/database");
const { shouldBypassFirebaseAuth } = require("./shared/providers/firebaseAdmin");

const HOST = shouldBypassFirebaseAuth
    ? "127.0.0.1"
    : (process.env.HOST || "0.0.0.0");

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
        console.warn(
            "Modo de desenvolvimento: a API iniciará, mas as rotas que usam o banco falharão até a conexão ser restabelecida."
        );
    }

    const servidor = app.listen(PORT, HOST, () => {
        console.log(`Servidor do DevCursos+ rodando em http://localhost:${PORT}`);
    });

    servidor.on("error", (erro) => {
        console.error("Erro ao iniciar o servidor:", erro.message);
        process.exitCode = 1;
        pool.end().catch(() => {});
    });

    let encerrando = false;
    async function encerrar(signal) {
        if (encerrando) return;
        encerrando = true;
        console.log(`Recebido ${signal}; encerrando servidor com segurança.`);

        servidor.close(async (erro) => {
            if (erro) {
                console.error("Erro ao encerrar o servidor HTTP:", erro.message);
                process.exitCode = 1;
            }

            try {
                await pool.end();
            } catch (erroBanco) {
                console.error("Erro ao fechar o pool MySQL:", erroBanco.message);
                process.exitCode = 1;
            }
        });
    }

    process.once("SIGINT", () => encerrar("SIGINT"));
    process.once("SIGTERM", () => encerrar("SIGTERM"));

    return servidor;
}

if (require.main === module) {
    startServer().catch((erro) => {
        console.error("Falha ao iniciar a API:", erro.message);
        process.exitCode = 1;
    });
}

module.exports = { startServer };
