const progressService = require("./progress.service");

// GET /cursos/:id/progresso
async function listarProgresso(req, res, next) {
    try {
        const resultado = await progressService.listarProgresso(
            req.firebaseUser.uid,
            req.params.id
        );

        return res.status(200).json(resultado);

    } catch (erro) {
        return next(erro);
    }
}

// PUT /aulas/:id/conclusao
async function atualizarConclusao(req, res, next) {
    try {
        const resultado = await progressService.atualizarConclusao(
            req.firebaseUser.uid,
            req.params.id,
            req.body.concluida
        );

        return res.status(200).json(resultado);

    } catch (erro) {
        return next(erro);
    }
}

module.exports = {
    listarProgresso,
    atualizarConclusao
};