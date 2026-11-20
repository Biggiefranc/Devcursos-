const service = require("./favorites.service");

async function listar(req, res) {
    const favoritos = await service.listar(req.firebaseUser.uid);
    return res.status(200).json({ favoritos });
}

async function atualizar(req, res) {
    const resultado = await service.atualizar(
        req.firebaseUser.uid,
        req.params.id,
        req.body?.favoritado
    );
    return res.status(200).json(resultado);
}

module.exports = { listar, atualizar };
