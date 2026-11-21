const service = require("./cursos.service");
const progressService = require("../progress/progress.service");

async function listarCursos(req, res) {
    return res.json(await service.listarCursos());
}

async function buscarCursoPorId(req, res) {
    return res.json(await service.buscarCursoPorId(req.params.id));
}

async function buscarConteudoPorCurso(req, res) {
    // Compatibilidade com clientes antigos: o endpoint não entrega o corpo integral das aulas.
    return res.json(await service.buscarEstruturaPorCurso(req.params.id));
}

async function buscarEstruturaPorCurso(req, res) {
    return res.json(await service.buscarEstruturaPorCurso(req.params.id));
}

async function listarModulosPorCurso(req, res) {
    return res.json(await service.listarModulosPorCurso(req.params.id));
}

async function listarAulasPorModulo(req, res) {
    return res.json(await service.listarAulasPorModulo(req.params.id));
}

async function buscarAulaPorId(req, res) {
    return res.json(await progressService.buscarAulaLiberada(
        req.firebaseUser.uid,
        req.params.id
    ));
}

module.exports = {
    listarCursos,
    buscarCursoPorId,
    buscarEstruturaPorCurso,
    buscarConteudoPorCurso,
    listarModulosPorCurso,
    listarAulasPorModulo,
    buscarAulaPorId
};
