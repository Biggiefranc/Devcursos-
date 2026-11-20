const express = require("express");
const autenticar = require("../../shared/middlewares/autenticar");
const controller = require("./favorites.controller");

const router = express.Router();
router.get("/me/favoritos", autenticar, controller.listar);
router.put("/cursos/:id/favorito", autenticar, controller.atualizar);
module.exports = router;
