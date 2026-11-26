const express = require("express");
const autenticar = require("../../shared/middlewares/autenticar");
const { avaliacaoPorConta } = require("../../shared/middlewares/limitarRequisicoes");
const controller = require("./assessments.controller");

const router = express.Router();
router.get("/cursos/:cursoId/avaliacao", autenticar, controller.buscarPorCurso);
router.get("/avaliacoes/:id", autenticar, controller.buscarPorId);
router.post("/avaliacoes/:id/tentativas", autenticar, avaliacaoPorConta, controller.registrarTentativa);
module.exports = router;
