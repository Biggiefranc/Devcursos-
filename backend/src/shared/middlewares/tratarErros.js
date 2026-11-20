const AppError = require("../errors/AppError");

function normalizarErro(erro) {
    if (erro instanceof AppError) return erro;

    // O Express/body-parser informa erros de JSON inválido e payload excedido.
    if (erro?.type === "entity.parse.failed") {
        return new AppError(400, "JSON_INVALIDO", "O corpo da requisição contém JSON inválido.");
    }

    if (erro?.type === "entity.too.large") {
        return new AppError(413, "CORPO_MUITO_GRANDE", "O corpo da requisição excede o limite permitido.");
    }

    if (erro?.code === "ER_DUP_ENTRY") {
        return new AppError(409, "REGISTRO_DUPLICADO", "Já existe um registro com esses dados.");
    }

    const statusCode = Number(erro?.statusCode || erro?.status);
    if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 500) {
        return new AppError(statusCode, "REQUISICAO_INVALIDA", erro.message || "Não foi possível processar a requisição.");
    }

    return new AppError(500, "ERRO_INTERNO", "Erro interno do servidor.");
}

function tratarErros(erro, req, res, next) {
    if (res.headersSent) return next(erro);

    const erroSeguro = normalizarErro(erro);
    const contexto = {
        requestId: req.id,
        metodo: req.method,
        caminho: req.path,
        status: erroSeguro.statusCode,
        codigo: erroSeguro.code
    };

    if (erroSeguro.statusCode >= 500) {
        const stack = typeof erro?.stack === "string"
            ? erro.stack.split("\n").slice(1, 6).map((linha) => linha.trim())
            : [];
        console.error("Falha inesperada na API:", contexto, {
            nome: erro?.name || "Error",
            codigoOriginal: erro?.code || null,
            stack
        });
    } else {
        console.warn("Requisição rejeitada:", contexto);
    }

    return res.status(erroSeguro.statusCode).json({
        mensagem: erroSeguro.message,
        codigo: erroSeguro.code
    });
}

module.exports = tratarErros;
