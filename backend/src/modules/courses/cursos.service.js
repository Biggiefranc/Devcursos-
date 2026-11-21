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

async function buscarEstruturaPorCurso(id) {
    const cursoId = validarIdPositivo(id, "ID do curso");
    const estrutura = await repository.buscarEstruturaPorCurso(cursoId);

    if (!estrutura) {
        throw new AppError(404, "CURSO_NAO_ENCONTRADO", "Curso não encontrado.");
    }

    return estrutura;
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

module.exports = {
    listarCursos,
    buscarCursoPorId,
    buscarEstruturaPorCurso,
    listarModulosPorCurso,
    listarAulasPorModulo
};
