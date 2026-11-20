const repository = require("./cursos.repository");
const AppError = require("../../shared/errors/AppError");
const { validarIdPositivo } = require("../../shared/validation/ids");

async function listarCursos() {
    return repository.listarCursos();
}

async function buscarCursoPorId(id) {
    const cursoId = validarIdPositivo(id, "ID do curso");
    const curso = await repository.buscarCursoPorId(cursoId);

    if (!curso) {
        throw new AppError(404, "CURSO_NAO_ENCONTRADO", "Curso não encontrado.");
    }

    return curso;
}

async function buscarConteudoPorCurso(id) {
    const cursoId = validarIdPositivo(id, "ID do curso");
    const curso = await repository.buscarConteudoPorCurso(cursoId);

    if (!curso) {
        throw new AppError(404, "CURSO_NAO_ENCONTRADO", "Curso não encontrado.");
    }

    return curso;
}

async function listarModulosPorCurso(id) {
    const cursoId = validarIdPositivo(id, "ID do curso");
    const curso = await repository.buscarCursoPorId(cursoId);

    if (!curso) {
        throw new AppError(404, "CURSO_NAO_ENCONTRADO", "Curso não encontrado.");
    }

    return repository.listarModulosPorCurso(cursoId);
}

async function listarAulasPorModulo(id) {
    const moduloId = validarIdPositivo(id, "ID do módulo");
    const modulo = await repository.buscarModuloPorId(moduloId);

    if (!modulo) {
        throw new AppError(404, "MODULO_NAO_ENCONTRADO", "Módulo não encontrado.");
    }

    return repository.listarAulasPorModulo(moduloId);
}

async function buscarAulaPorId(id) {
    const aulaId = validarIdPositivo(id, "ID da aula");
    const aula = await repository.buscarAulaPorId(aulaId);

    if (!aula) {
        throw new AppError(404, "AULA_NAO_ENCONTRADA", "Aula não encontrada.");
    }

    return aula;
}

module.exports = {
    listarCursos,
    buscarCursoPorId,
    buscarConteudoPorCurso,
    listarModulosPorCurso,
    listarAulasPorModulo,
    buscarAulaPorId
};
