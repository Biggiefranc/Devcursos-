const repository = require("./favorites.repository");
const usersRepository = require("../users/users.repository");
const coursesRepository = require("../courses/cursos.repository");
const AppError = require("../../shared/errors/AppError");
const { validarIdPositivo } = require("../../shared/validation/ids");

async function obterUsuarioId(firebaseUid) {
    const usuario = await usersRepository.buscarPorFirebaseUid(firebaseUid);
    if (!usuario) {
        throw new AppError(
            404,
            "PERFIL_NAO_ENCONTRADO",
            "Perfil não encontrado. Sincronize seu perfil antes de salvar favoritos."
        );
    }
    return usuario.id;
}

async function listar(firebaseUid) {
    const usuarioId = await obterUsuarioId(firebaseUid);
    return repository.listarPorUsuario(usuarioId);
}

async function atualizar(firebaseUid, cursoId, favoritado) {
    const id = validarIdPositivo(cursoId, "ID do curso");
    if (typeof favoritado !== "boolean") {
        throw new AppError(400, "FAVORITO_INVALIDO", "O campo favoritado deve ser verdadeiro ou falso.");
    }

    const usuarioId = await obterUsuarioId(firebaseUid);
    const curso = await coursesRepository.buscarCursoPorId(id);
    if (!curso) {
        throw new AppError(404, "CURSO_NAO_ENCONTRADO", "Curso não encontrado.");
    }

    if (favoritado) await repository.adicionar(usuarioId, id);
    else await repository.remover(usuarioId, id);

    return { cursoId: id, favoritado };
}

module.exports = { listar, atualizar };
