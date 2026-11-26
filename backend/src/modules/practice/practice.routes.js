const express = require("express");
const autenticar = require("../../shared/middlewares/autenticar");
const { praticaPorConta } = require("../../shared/middlewares/limitarRequisicoes");
const controller = require("./practice.controller");

const router = express.Router();
router.post("/aulas/:id/exercicio/tentativas", autenticar, praticaPorConta, controller.registrarTentativa);
module.exports = router;
