const express = require("express");
const autenticar = require("../../shared/middlewares/autenticar");
const controller = require("./cursos.controller");

const router = express.Router();

router.get("/cursos", controller.listarCursos);
router.get("/cursos/:id/conteudo", autenticar, controller.buscarConteudoPorCurso);
router.get("/cursos/:id/estrutura", controller.buscarEstruturaPorCurso);
router.get("/cursos/:id", controller.buscarCursoPorId);
router.get("/cursos/:id/modulos", controller.listarModulosPorCurso);
router.get("/modulos/:id/aulas", controller.listarAulasPorModulo);
router.get("/aulas/:id", autenticar, controller.buscarAulaPorId);

module.exports = router;
