const express = require("express");
const autenticar = require("../../shared/middlewares/autenticar");
const controller = require("./practice.controller");

const router = express.Router();
router.post("/aulas/:id/exercicio/tentativas", autenticar, controller.registrarTentativa);
module.exports = router;
