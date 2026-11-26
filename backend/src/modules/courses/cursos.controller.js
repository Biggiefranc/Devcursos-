const service = require("./cursos.service");
const progressService = require("../progress/progress.service");
const { modoExecucao } = require("../execution/execution.service");

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
    const aula = await progressService.buscarAulaLiberada(
        req.firebaseUser.uid,
        req.params.id
    );
    const linguagem = aula.linguagem || "python";
    const modo = aula.exercicio ? await modoExecucao(linguagem) : null;
    return res.json({
        ...aula,
        modoExecucao: modo,
        correcaoDisponivel: linguagem === "python" && modo === "remoto",
    });
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
