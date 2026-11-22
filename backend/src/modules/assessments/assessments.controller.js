const service = require("./assessments.service");

async function buscarPorCurso(req, res) {
    const avaliacao = await service.buscarPorCurso(
        req.firebaseUser.uid,
        req.params.cursoId
    );
    return res.status(200).json(avaliacao);
}

async function buscarPorId(req, res) {
    const avaliacao = await service.buscarPorId(
        req.firebaseUser.uid,
        req.params.id,
    );
    return res.status(200).json(avaliacao);
}

async function registrarTentativa(req, res) {
    const resultado = await service.registrarTentativa(
        req.firebaseUser.uid,
        req.params.id,
        req.body?.respostas
    );
    return res.status(201).json(resultado);
}

module.exports = { buscarPorCurso, buscarPorId, registrarTentativa };
