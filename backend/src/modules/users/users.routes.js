const express = require("express");

const autenticar = require("../../shared/middlewares/autenticar");
const { perfilPorConta } = require("../../shared/middlewares/limitarRequisicoes");
const usersController = require("./users.controller");

const router = express.Router();

// Sincroniza o perfil MySQL com a conta Firebase.
router.post(
    "/usuarios/sincronizar",
    autenticar,
    perfilPorConta,
    usersController.sincronizarPerfil
);

// Recupera o perfil do usuário autenticado.
router.get(
    "/me",
    autenticar,
    usersController.buscarPerfil
);

module.exports = router;
