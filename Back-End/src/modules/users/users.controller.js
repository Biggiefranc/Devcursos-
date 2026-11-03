const usersService = require("./users.service");

// Cria ou vincula o perfil do usuário autenticado.
async function sincronizarPerfil(req, res, next) {
    try {
        const resultado = await usersService.sincronizarPerfil({
            firebaseUser: req.firebaseUser,
            nome: req.body?.nome
        });

        const mensagens = {
            criado: "Perfil criado com sucesso!",
            ja_vinculado: "Perfil sincronizado com sucesso!"
        };

        const statusCode = resultado.acao === "criado" ? 201 : 200;

        return res.status(statusCode).json({
            mensagem: mensagens[resultado.acao],
            usuario: resultado.usuario
        });

    } catch (erro) {
        return next(erro);
    }
}

// Retorna o perfil do usuário autenticado.
async function buscarPerfil(req, res, next) {
    try {
        const usuario = await usersService.buscarPerfil(
            req.firebaseUser.uid
        );

        return res.status(200).json({
            usuario
        });

    } catch (erro) {
        return next(erro);
    }
}

module.exports = {
    sincronizarPerfil,
    buscarPerfil
};