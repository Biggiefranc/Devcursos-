const usersService = require("./users.service");

// Padroniza as respostas de erro do módulo.
function responderErro(res, erro) {
    const statusCode = erro.statusCode || 500;

    if (statusCode >= 500) {
        console.error("Erro no módulo users:", erro);
    }

    return res.status(statusCode).json({
        codigo: erro.codigo || "ERRO_INTERNO",
        mensagem: statusCode >= 500
            ? "Ocorreu um erro ao processar sua solicitação."
            : erro.message
    });
}

// Cria ou vincula o perfil do usuário autenticado.
async function sincronizarPerfil(req, res) {
    try {
        const resultado = await usersService.sincronizarPerfil({
            firebaseUser: req.firebaseUser,
            nome: req.body?.nome
        });

        const mensagens = {
            criado: "Perfil criado com sucesso!",
            vinculado: "Conta antiga vinculada com sucesso!",
            ja_vinculado: "Perfil sincronizado com sucesso!"
        };

        const statusCode = resultado.acao === "criado" ? 201 : 200;

        return res.status(statusCode).json({
            mensagem: mensagens[resultado.acao],
            usuario: resultado.usuario
        });

    } catch (erro) {
        return responderErro(res, erro);
    }
}

// Retorna o perfil do usuário autenticado.
async function buscarPerfil(req, res) {
    try {
        const usuario = await usersService.buscarPerfil(
            req.firebaseUser.uid
        );

        return res.status(200).json({
            usuario
        });

    } catch (erro) {
        return responderErro(res, erro);
    }
}

module.exports = {
    sincronizarPerfil,
    buscarPerfil
};