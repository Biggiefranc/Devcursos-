const service = require("./assessments.service");

async function buscarPorCurso(req, res, next) {
    try {
        const avaliacao = await service.buscarPorCurso(req.firebaseUser.uid, req.params.cursoId);
        return res.status(200).json(avaliacao);
    } catch (erro) { return next(erro); }
}

async function registrarTentativa(req, res, next) {
    try {
        const resultado = await service.registrarTentativa(
            req.firebaseUser.uid,
            req.params.id,
            req.body?.respostas
        );
        return res.status(201).json(resultado);
    } catch (erro) { return next(erro); }
}

module.exports = { buscarPorCurso, registrarTentativa };
