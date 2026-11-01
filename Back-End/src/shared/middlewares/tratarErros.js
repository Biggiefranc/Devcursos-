function tratarErros(erro, req, res, next) {
    console.error("Erro na API:", erro);

    const statusCode = erro.statusCode || 500;

    return res.status(statusCode).json({
        mensagem: statusCode === 500
            ? "Erro interno do servidor."
            : erro.message
    });
}

module.exports = tratarErros;