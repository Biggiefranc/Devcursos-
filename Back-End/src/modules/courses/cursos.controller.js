const service = require("./cursos.service");

async function listarCursos(req, res, next) {
    try {
        const cursos = await service.listarCursos();
        return res.json(cursos);
    } catch (erro) {
        next(erro);
    }
}

async function buscarCursoPorId(req, res, next) {
    try {
        const curso = await service.buscarCursoPorId(req.params.id);
        return res.json(curso);
    } catch (erro) {
        next(erro);
    }
}

async function listarModulosPorCurso(req, res, next) {
    try {
        const modulos = await service.listarModulosPorCurso(req.params.id);
        return res.json(modulos);
    } catch (erro) {
        next(erro);
    }
}

async function listarAulasPorModulo(req, res, next) {
    try {
        const aulas = await service.listarAulasPorModulo(req.params.id);
        return res.json(aulas);
    } catch (erro) {
        next(erro);
    }
}

async function buscarAulaPorId(req, res, next) {
    try {
        const aula = await service.buscarAulaPorId(req.params.id);
        return res.json(aula);
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    listarCursos,
    buscarCursoPorId,
    listarModulosPorCurso,
    listarAulasPorModulo,
    buscarAulaPorId
};