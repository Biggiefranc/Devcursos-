const AppError = require("../../shared/errors/AppError");

const linguagens = Object.freeze({
    python: { arquivo: "main.py", versao: process.env.PISTON_PYTHON_VERSION || "3" },
    java: { arquivo: "Main.java", versao: process.env.PISTON_JAVA_VERSION || "*" }
});

const emDesenvolvimento = process.env.NODE_ENV !== "production";
const piston = process.env.PISTON_API_URL?.trim().replace(/\/+$/, "");
const token = process.env.PISTON_API_TOKEN?.trim();
const ativos = new Set();
const ultimaExecucao = new Map();
const sondas = new Map();
const programasDeSonda = {
    python: 'print("devcursos-executor-ok")',
    java: 'public class Main { public static void main(String[] args) { System.out.println("devcursos-executor-ok"); } }'
};

function validarPrograma({ linguagem, codigo, entrada = "" } = {}) {
    if (typeof linguagem !== "string" || !Object.hasOwn(linguagens, linguagem)) {
        throw new AppError(400, "LINGUAGEM_INVALIDA", "Escolha Python ou Java.");
    }
    if (typeof codigo !== "string" || !codigo.trim() || codigo.length > 12000) {
        throw new AppError(400, "CODIGO_INVALIDO", "Digite um código com até 12.000 caracteres.");
    }
    if (typeof entrada !== "string" || entrada.length > 4000) {
        throw new AppError(400, "ENTRADA_INVALIDA", "A entrada deve ter até 4.000 caracteres.");
    }
    return { linguagem, codigo, entrada };
}

async function comLimite(uid, executar) {
    const agora = Date.now();
    for (const [usuario, instante] of ultimaExecucao) {
        if (agora - instante > 10000) ultimaExecucao.delete(usuario);
    }
    if (ativos.has(uid) || agora - (ultimaExecucao.get(uid) ?? 0) < 1000) {
        throw new AppError(429, "MUITAS_EXECUCOES", "Aguarde um instante antes de executar novamente.");
    }
    if (ativos.size >= 8) {
        throw new AppError(503, "EXECUTOR_OCUPADO", "O executor está ocupado. Tente novamente em instantes.");
    }
    ativos.add(uid);
    ultimaExecucao.set(uid, agora);
    try {
        return await executar();
    } finally {
        ativos.delete(uid);
    }
}

async function verificarExecutor(linguagem) {
    if (!piston || !Object.hasOwn(linguagens, linguagem)) return false;

    const anterior = sondas.get(linguagem);
    if (anterior && (anterior.expiraEm === null || anterior.expiraEm > Date.now())) {
        return anterior.resultado;
    }

    const sonda = { expiraEm: null };
    sonda.resultado = executarJob({
        linguagem,
        codigo: programasDeSonda[linguagem],
        entrada: "",
        signal: AbortSignal.timeout(4500),
    }).then(({ ok, saida }) => ok && saida.trim() === "devcursos-executor-ok", () => false)
        .then((disponivel) => {
            sonda.expiraEm = Date.now() + (disponivel ? 60000 : 15000);
            return disponivel;
        });
    sondas.set(linguagem, sonda);
    return sonda.resultado;
}

async function modoExecucao(linguagem) {
    if (await verificarExecutor(linguagem)) return "remoto";
    if (emDesenvolvimento && linguagem === "python") return "navegador";
    return "indisponivel";
}

async function executarJob({ linguagem, codigo, entrada, arquivosAdicionais = [], signal }) {
    if (!piston) {
        throw new AppError(503, "EXECUTOR_NAO_CONFIGURADO", "A execução desta linguagem está indisponível.");
    }
    const runtime = linguagens[linguagem];
    const inicio = Date.now();
    const prazo = AbortSignal.timeout(16000);
    const sinal = signal ? AbortSignal.any([prazo, signal]) : prazo;
    let resposta;
    let resultado;
    try {
        resposta = await fetch(piston + "/execute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                language: linguagem,
                version: runtime.versao,
                files: [{ name: runtime.arquivo, content: codigo }, ...arquivosAdicionais],
                stdin: entrada,
                run_timeout: 3000,
                run_cpu_time: 2000,
                ...(linguagem === "python" ? { run_memory_limit: 128 * 1024 * 1024 } : {}),
                compile_timeout: 10000,
                compile_cpu_time: 8000
            }),
            redirect: "error",
            signal: sinal,
        });
        if (resposta.ok) {
            resultado = await resposta.json();
        }
    } catch (erro) {
        if (sinal.aborted) {
            throw new AppError(504, "EXECUTOR_DEMOROU", "O serviço de execução demorou demais. Tente novamente.");
        }
        if (erro instanceof SyntaxError) {
            throw new AppError(502, "RESPOSTA_INVALIDA_DO_EXECUTOR", "O serviço devolveu um resultado inválido.");
        }
        throw new AppError(502, "EXECUTOR_INACESSIVEL", "Não foi possível conectar ao serviço de execução.");
    }

    if (!resposta.ok) {
        await resposta.body?.cancel();
        if ([401, 403].includes(resposta.status)) {
            throw new AppError(503, "EXECUTOR_SEM_ACESSO", "O serviço de execução precisa de autorização.");
        }
        if (resposta.status === 429) {
            throw new AppError(503, "EXECUTOR_OCUPADO", "O serviço atingiu o limite de execuções. Tente novamente em instantes.");
        }
        throw new AppError(502, "EXECUTOR_FALHOU", "O serviço não conseguiu iniciar esta execução.");
    }

    const compilacao = resultado?.compile;
    const falhouAoCompilar = compilacao && (compilacao.code !== 0 || compilacao.signal || compilacao.status);
    const etapa = falhouAoCompilar ? compilacao : resultado?.run;
    if (!etapa || typeof etapa.stdout !== "string" || typeof etapa.stderr !== "string"
        || (!Number.isInteger(etapa.code) && !(etapa.code === null && (etapa.signal || etapa.status)))) {
        throw new AppError(502, "RESPOSTA_INVALIDA_DO_EXECUTOR", "O serviço devolveu um resultado inválido.");
    }
    const ok = etapa.code === 0 && !etapa.signal && !etapa.status;
    const detalhe = [etapa.stderr, etapa.message].filter(Boolean).join("\n");
    return {
        modo: "remoto",
        saida: etapa.stdout.slice(0, 65536),
        erro: (detalhe || (!ok ? "A execução foi interrompida pelo serviço." : "")).slice(0, 16000),
        ok,
        tempoExecucao: Number.isFinite(etapa.wall_time) ? etapa.wall_time : null,
        tempoRespostaMs: Date.now() - inicio
    };
}

async function executarRemoto(programa) {
    try {
        return await executarJob(programa);
    } catch (erro) {
        if (!programa.signal?.aborted) sondas.delete(programa.linguagem);
        throw erro;
    }
}

module.exports = { validarPrograma, comLimite, modoExecucao, verificarExecutor, executarRemoto };
