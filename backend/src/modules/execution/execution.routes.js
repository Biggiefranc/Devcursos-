const express = require("express");
const autenticar = require("../../shared/middlewares/autenticar");
const { validarPrograma, modoExecucao, comLimite, executarRemoto } = require("./execution.service");

const router = express.Router();
router.post("/api/executar", autenticar, async (req, res) => {
    const programa = validarPrograma(req.body || {});
    const modo = modoExecucao(programa.linguagem);
    if (modo === "navegador") return res.json({ modo });
    return res.json(await comLimite(req.firebaseUser.uid, () => executarRemoto(programa)));
});
module.exports = router;
