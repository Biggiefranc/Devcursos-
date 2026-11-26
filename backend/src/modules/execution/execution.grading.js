const fs = require("node:fs");
const path = require("node:path");
const { executarRemoto } = require("./execution.service");

const verificador = fs.readFileSync(path.join(__dirname, "verificar-python.py"), "utf8");

async function executarCasosPython(codigo, avaliador) {
    const prazo = AbortSignal.timeout(32000);
    const resultados = [];
    // Cada job recebe só o caso corrente. Os valores esperados ficam na API.
    for (const { entradas, argumentos } of avaliador.casos) {
        const execucao = await executarRemoto({
            linguagem: "python",
            codigo: verificador,
            arquivosAdicionais: [{ name: "submissao.py", content: codigo }],
            entrada: JSON.stringify({
                tipo: avaliador.tipo,
                nomeFuncao: avaliador.nome_funcao,
                entradas,
                argumentos,
            }),
            signal: prazo,
        });
        resultados.push(observarResultado(execucao, avaliador.tipo));
    }
    return resultados;
}

function observarResultado(execucao, tipo) {
    if (!execucao.ok) return { erro: (execucao.erro || "Falha de execução.").slice(-4000) };

    const saida = execucao.saida.trim();
    if (saida.length <= 12000) {
        try {
            const valor = JSON.parse(saida);
            if (tipo !== "saida" || typeof valor === "string") return { valor };
        } catch {
            // A submissão pode interromper o processo ou emitir uma saída fora do formato.
        }
    }
    return { erro: "A execução não produziu um resultado válido para este caso." };
}

module.exports = { executarCasosPython };
