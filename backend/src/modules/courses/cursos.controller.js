const service = require("./cursos.service");

async function listarCursos(req, res) {
    return res.json(await service.listarCursos());
}

async function buscarCursoPorId(req, res) {
    return res.json(await service.buscarCursoPorId(req.params.id));
}

async function buscarConteudoPorCurso(req, res) {
    return res.json(await service.buscarConteudoPorCurso(req.params.id));
}

async function listarModulosPorCurso(req, res) {
    return res.json(await service.listarModulosPorCurso(req.params.id));
}

async function listarAulasPorModulo(req, res) {
    return res.json(await service.listarAulasPorModulo(req.params.id));
}

async function buscarAulaPorId(req, res) {
    return res.json(await service.buscarAulaPorId(req.params.id));
}

module.exports = {
    listarCursos,
    buscarCursoPorId,
    buscarConteudoPorCurso,
    listarModulosPorCurso,
    listarAulasPorModulo,
    buscarAulaPorId
};
