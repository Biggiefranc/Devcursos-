const usersService = require("./users.service");

// Cria ou vincula o perfil do usuário autenticado.
async function sincronizarPerfil(req, res) {
    const resultado = await usersService.sincronizarPerfil({
        firebaseUser: req.firebaseUser,
        nome: req.body?.nome
    });

    const mensagem = resultado.acao === "criado"
        ? "Perfil criado com sucesso!"
        : "Perfil sincronizado com sucesso!";

    return res.status(resultado.acao === "criado" ? 201 : 200).json({
        mensagem,
        usuario: resultado.usuario
    });
}

// Retorna o perfil do usuário autenticado.
async function buscarPerfil(req, res) {
    const usuario = await usersService.buscarPerfil(req.firebaseUser.uid);
    return res.status(200).json({ usuario });
}

module.exports = {
    sincronizarPerfil,
    buscarPerfil
};
