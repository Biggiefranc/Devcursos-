const { rateLimit } = require("express-rate-limit");

function criarLimite(identifier, limit, minutos, porConta = false) {
    return rateLimit({
        identifier,
        limit,
        windowMs: minutos * 60_000,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: {
            codigo: "LIMITE_DE_REQUISICOES",
            mensagem: "Muitas requisições. Aguarde um momento antes de tentar novamente.",
        },
        ...(porConta ? { keyGenerator: (req) => req.firebaseUser.uid } : {}),
    });
}

module.exports = {
    geralPorIp: criarLimite("api-ip", 180, 1),
    saudePorIp: criarLimite("saude-ip", 120, 1),
    perfilPorIp: criarLimite("perfil-ip", 30, 1),
    execucaoPorIp: criarLimite("execucao-ip", 60, 1),
    avaliacaoPorIp: criarLimite("avaliacao-ip", 30, 1),
    perfilPorConta: criarLimite("perfil-conta", 10, 1, true),
    execucaoPorConta: criarLimite("execucao-conta", 30, 1, true),
    praticaPorConta: criarLimite("pratica-conta", 12, 1, true),
    avaliacaoPorConta: criarLimite("avaliacao-conta", 10, 15, true),
    reinicioPorConta: criarLimite("reinicio-conta", 3, 10, true),
};
