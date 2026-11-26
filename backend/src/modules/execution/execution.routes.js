const express = require("express");
const autenticar = require("../../shared/middlewares/autenticar");
const { execucaoPorConta } = require("../../shared/middlewares/limitarRequisicoes");
const { validarPrograma, modoExecucao, comLimite, executarRemoto } = require("./execution.service");

const router = express.Router();
router.post("/api/executar", autenticar, execucaoPorConta, async (req, res) => {
    const programa = validarPrograma(req.body || {});
    const modo = await modoExecucao(programa.linguagem);
    if (modo === "navegador") return res.json({ modo });
    if (modo === "indisponivel") {
        return res.status(503).json({
            codigo: "EXECUTOR_INDISPONIVEL",
            mensagem: "O serviço de execução está indisponível. Tente novamente em instantes.",
        });
    }
    return res.json(await comLimite(req.firebaseUser.uid, () => executarRemoto(programa)));
});
module.exports = router;
