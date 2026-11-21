const progressService = require("./progress.service");

// GET /cursos/:id/progresso
async function listarProgresso(req, res) {
    const resultado = await progressService.listarProgresso(
        req.firebaseUser.uid,
        req.params.id
    );
    return res.status(200).json(resultado);
}

async function listarResumo(req, res) {
    const cursos = await progressService.listarResumo(req.firebaseUser.uid);
    return res.status(200).json({ cursos });
}

// PUT /aulas/:id/conclusao
async function atualizarConclusao(req, res) {
    const resultado = await progressService.atualizarConclusao(
        req.firebaseUser.uid,
        req.params.id,
        req.body?.concluida
    );
    return res.status(200).json(resultado);
}

async function reiniciarProgresso(req, res) {
    const resultado = await progressService.reiniciarProgresso(
        req.firebaseUser.uid,
        req.params.id
    );
    return res.status(200).json(resultado);
}

module.exports = {
    listarProgresso,
    listarResumo,
    atualizarConclusao,
    reiniciarProgresso
};
