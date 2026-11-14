const service = require("./favorites.service");

async function listar(req, res, next) {
    try {
        const favoritos = await service.listar(req.firebaseUser.uid);
        return res.status(200).json({ favoritos });
    } catch (erro) { return next(erro); }
}

async function atualizar(req, res, next) {
    try {
        const resultado = await service.atualizar(
            req.firebaseUser.uid,
            req.params.id,
            req.body?.favoritado
        );
        return res.status(200).json(resultado);
    } catch (erro) { return next(erro); }
}

module.exports = { listar, atualizar };
