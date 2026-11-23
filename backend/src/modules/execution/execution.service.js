const AppError = require("../../shared/errors/AppError");

const linguagens = Object.freeze({
    python: { arquivo: "main.py", versao: process.env.PISTON_PYTHON_VERSION || "3" },
    java: { arquivo: "Main.java", versao: process.env.PISTON_JAVA_VERSION || "*" }
});

const emDesenvolvimento = process.env.NODE_ENV !== "production";
const piston = process.env.PISTON_API_URL?.trim();
const token = process.env.PISTON_API_TOKEN?.trim();
const ativos = new Set();
const ultimaExecucao = new Map();

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

function modoExecucao(linguagem) {
    if (piston) return "remoto";
    if (emDesenvolvimento && linguagem === "python") return "navegador";
    return "indisponivel";
}

async function executarRemoto({ linguagem, codigo, entrada }) {
    if (!piston) {
        throw new AppError(503, "EXECUTOR_NAO_CONFIGURADO", "A execução desta linguagem está indisponível.");
    }
    const runtime = linguagens[linguagem];
    const inicio = Date.now();
    let resposta;
    try {
        resposta = await fetch(piston.replace(/\/+$/, "") + "/execute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                language: linguagem,
                version: runtime.versao,
                files: [{ name: runtime.arquivo, content: codigo }],
                stdin: entrada,
                run_timeout: 3000,
                run_cpu_time: 2000,
                compile_timeout: 10000,
                compile_cpu_time: 8000
            }),
            redirect: "error",
            signal: AbortSignal.timeout(16000),
        });
    } catch (erro) {
        if (erro.name === "TimeoutError") {
            throw new AppError(504, "EXECUTOR_DEMOROU", "O serviço de execução demorou demais. Tente novamente.");
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

    const resultado = await resposta.json().catch(() => null);
    const compilacao = resultado?.compile;
    const falhouAoCompilar = compilacao && (compilacao.code !== 0 || compilacao.signal || compilacao.status);
    const etapa = falhouAoCompilar ? compilacao : resultado?.run;
    if (!etapa || typeof etapa.stdout !== "string" || typeof etapa.stderr !== "string") {
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

module.exports = { validarPrograma, comLimite, modoExecucao, executarRemoto };
