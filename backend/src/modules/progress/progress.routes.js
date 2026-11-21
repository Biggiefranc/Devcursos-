const express = require("express");
const controller = require("./progress.controller");
const autenticar = require("../../shared/middlewares/autenticar");

const router = express.Router();

// Todas as rotas de progresso exigem autenticação Firebase.
router.get(
    "/cursos/:id/progresso",
    autenticar,
    controller.listarProgresso
);

router.get(
    "/me/progresso",
    autenticar,
    controller.listarResumo
);

router.put(
    "/aulas/:id/conclusao",
    autenticar,
    controller.atualizarConclusao
);

router.delete(
    "/cursos/:id/progresso",
    autenticar,
    controller.reiniciarProgresso
);

module.exports = router;
