const service = require("./practice.service");

async function registrarTentativa(req, res) {
    const resultado = await service.registrarTentativa(
        req.firebaseUser.uid,
        req.params.id,
        req.body,
    );
    return res.status(201).json(resultado);
}

module.exports = { registrarTentativa };
