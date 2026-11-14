const repository = require("./favorites.repository");
const usersRepository = require("../users/users.repository");
const coursesRepository = require("../courses/cursos.repository");

function validarId(id) {
    const numero = Number(id);
    if (!Number.isSafeInteger(numero) || numero <= 0) {
        const erro = new Error("Identificador de curso inválido.");
        erro.statusCode = 400;
        throw erro;
    }
    return numero;
}

async function obterUsuarioId(firebaseUid) {
    const usuario = await usersRepository.buscarPorFirebaseUid(firebaseUid);
    if (!usuario) {
        const erro = new Error("Perfil não encontrado. Sincronize seu perfil antes de salvar favoritos.");
        erro.statusCode = 404;
        throw erro;
    }
    return usuario.id;
}

async function listar(firebaseUid) {
    const usuarioId = await obterUsuarioId(firebaseUid);
    return repository.listarPorUsuario(usuarioId);
}

async function atualizar(firebaseUid, cursoId, favoritado) {
    const id = validarId(cursoId);
    if (typeof favoritado !== "boolean") {
        const erro = new Error("O campo favoritado deve ser verdadeiro ou falso.");
        erro.statusCode = 400;
        throw erro;
    }

    const usuarioId = await obterUsuarioId(firebaseUid);
    const curso = await coursesRepository.buscarCursoPorId(id);
    if (!curso) {
        const erro = new Error("Curso não encontrado.");
        erro.statusCode = 404;
        throw erro;
    }

    if (favoritado) await repository.adicionar(usuarioId, id);
    else await repository.remover(usuarioId, id);

    return { cursoId: id, favoritado };
}

module.exports = { listar, atualizar };
