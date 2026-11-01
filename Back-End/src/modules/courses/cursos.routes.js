const express = require("express");
const controller = require("./cursos.controller");

const router = express.Router();

router.get("/cursos", controller.listarCursos);
router.get("/cursos/:id", controller.buscarCursoPorId);
router.get("/cursos/:id/modulos", controller.listarModulosPorCurso);
router.get("/modulos/:id/aulas", controller.listarAulasPorModulo);
router.get("/aulas/:id", controller.buscarAulaPorId);

module.exports = router;