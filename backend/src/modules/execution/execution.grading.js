const fs = require("node:fs");
const path = require("node:path");
const { executarRemoto } = require("./execution.service");

const verificador = fs.readFileSync(path.join(__dirname, "verificar-python.py"), "utf8");

async function executarCasosPython(codigo, avaliador) {
    const dados = Buffer.from(JSON.stringify({
        codigo,
        avaliador: {
            tipo: avaliador.tipo,
            nomeFuncao: avaliador.nome_funcao,
            casos: avaliador.casos.map(({ entradas, argumentos }) => ({ entradas, argumentos }))
        }
    })).toString("base64");
    const programa = [
        verificador,
        "import base64",
        `dados = json.loads(base64.b64decode("${dados}"))`,
        'print(executar(dados["codigo"], json.dumps(dados["avaliador"])))'
    ].join("\n");
    const execucao = await executarRemoto({ linguagem: "python", codigo: programa, entrada: "" });
    if (!execucao.ok) {
        return avaliador.casos.map(() => ({ erro: (execucao.erro || "Falha de execução.").slice(-4000) }));
    }
    try {
        const resultados = JSON.parse(execucao.saida);
        if (Array.isArray(resultados) && resultados.length === avaliador.casos.length) return resultados;
    } catch {
        // O runner pode cortar saídas grandes.
    }
    return avaliador.casos.map(() => ({ erro: "A saída da verificação foi interrompida. Reduza a saída do programa e execute novamente." }));
}

module.exports = { executarCasosPython };
