const service = require("./practice.service");
const progressService = require("../progress/progress.service");

async function registrarTentativa(req, res) {
    await progressService.buscarAulaLiberada(req.firebaseUser.uid, req.params.id);
    const resultado = await service.registrarTentativa(
        req.firebaseUser.uid,
        req.params.id,
        req.body,
    );
    return res.status(201).json(resultado);
}

module.exports = { registrarTentativa };
