const repository = require("./cursos.repository");

function validarId(id) {
    const numero = Number(id);

    if (!Number.isInteger(numero) || numero <= 0) {
        const erro = new Error("ID inválido.");
        erro.statusCode = 400;
        throw erro;
    }

    return numero;
}

async function listarCursos() {
    return repository.listarCursos();
}

async function buscarCursoPorId(id) {
    const cursoId = validarId(id);
    const curso = await repository.buscarCursoPorId(cursoId);

    if (!curso) {
        const erro = new Error("Curso não encontrado.");
        erro.statusCode = 404;
        throw erro;
    }

    return curso;
}

async function listarModulosPorCurso(id) {
    const cursoId = validarId(id);
    const curso = await repository.buscarCursoPorId(cursoId);

    if (!curso) {
        const erro = new Error("Curso não encontrado.");
        erro.statusCode = 404;
        throw erro;
    }

    return repository.listarModulosPorCurso(cursoId);
}

async function listarAulasPorModulo(id) {
    const moduloId = validarId(id);
    const modulo = await repository.buscarModuloPorId(moduloId);

    if (!modulo) {
        const erro = new Error("Módulo não encontrado.");
        erro.statusCode = 404;
        throw erro;
    }

    return repository.listarAulasPorModulo(moduloId);
}

async function buscarAulaPorId(id) {
    const aulaId = validarId(id);
    const aula = await repository.buscarAulaPorId(aulaId);

    if (!aula) {
        const erro = new Error("Aula não encontrada.");
        erro.statusCode = 404;
        throw erro;
    }

    return aula;
}

module.exports = {
    listarCursos,
    buscarCursoPorId,
    listarModulosPorCurso,
    listarAulasPorModulo,
    buscarAulaPorId
};