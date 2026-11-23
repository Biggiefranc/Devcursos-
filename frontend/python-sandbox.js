import workerSource from "./python-worker.js?raw";

let sessao;
let proximoId = 0;

function iniciarWorker(porta, codigoWorker) {
  const url = URL.createObjectURL(new Blob([codigoWorker], { type: "text/javascript" }));
  try {
    // O Chrome falha ao carregar workers do tipo module a partir de blob
    // em frames de origem opaca. O worker clássico importa o runtime por URL.
    const worker = new Worker(url);
    worker.onmessage = ({ data }) => {
      URL.revokeObjectURL(url);
      porta.postMessage(data);
    };
    worker.onerror = (evento) => {
      URL.revokeObjectURL(url);
      console.error("Falha no worker Python", evento.message);
      porta.postMessage({ tipo: "falha", mensagem: "O interpretador foi interrompido. Tente novamente." });
    };
    porta.onmessage = ({ data }) => worker.postMessage(data);
  } catch {
    URL.revokeObjectURL(url);
    porta.postMessage({ tipo: "falha", mensagem: "O navegador não conseguiu iniciar o editor Python." });
  }
}

function abrirSessao() {
  const quadro = document.createElement("iframe");
  const { port1, port2 } = new MessageChannel();
  const pendentes = new Map();
  const atual = { porta: port1, pendentes, pronta: null };
  quadro.hidden = true;
  quadro.title = "Ambiente isolado de execução Python";
  quadro.setAttribute("sandbox", "allow-scripts");
  quadro.referrerPolicy = "no-referrer";

  const nonce = crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16))).join("-");
  const fonte = JSON.stringify(workerSource).replace(/</g, "\\u003c");
  quadro.srcdoc = `<!doctype html>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' blob: 'wasm-unsafe-eval' https://cdn.jsdelivr.net/pyodide/v314.0.8/; connect-src https://cdn.jsdelivr.net/pyodide/v314.0.8/; worker-src blob:; base-uri 'none'; form-action 'none'">
    <script nonce="${nonce}">
      addEventListener("message", function iniciar(evento) {
        if (evento.source !== parent || evento.data !== "iniciar-python" || !evento.ports[0]) return;
        removeEventListener("message", iniciar);
        (${iniciarWorker.toString()})(evento.ports[0], ${fonte});
      });
    </script>`;

  atual.pronta = new Promise((resolve, reject) => {
    const limite = setTimeout(() => {
      encerrar("O Python demorou para carregar. Confira a conexão e tente novamente.");
    }, 45000);

    function encerrar(mensagem) {
      const erro = new Error(mensagem);
      clearTimeout(limite);
      port1.close();
      quadro.remove();
      if (sessao === atual) sessao = null;
      reject(erro);
      for (const pendente of pendentes.values()) pendente.rejeitar(erro);
      pendentes.clear();
    }

    atual.encerrar = encerrar;
    port1.onmessage = ({ data }) => {
      if (data?.tipo === "pronto") {
        clearTimeout(limite);
        resolve();
        return;
      }
      if (data?.tipo === "falha") {
        encerrar(data.mensagem);
        return;
      }
      const pendente = pendentes.get(data?.id);
      if (!pendente) return;
      pendentes.delete(data.id);
      if (data.erro) {
        const erro = new Error("O Python encontrou um erro. Confira o detalhe abaixo.");
        erro.detalhe = data.erro;
        pendente.rejeitar(erro);
      } else {
        pendente.resolver(data.resultados);
      }
    };

    quadro.addEventListener("load", () => {
      quadro.contentWindow?.postMessage("iniciar-python", "*", [port2]);
    }, { once: true });
    document.body.append(quadro);
  });
  return atual;
}

export async function executarPython(codigo, avaliador) {
  const atual = sessao ??= abrirSessao();
  await atual.pronta;
  if (sessao !== atual) throw new Error("O Python foi interrompido. Execute novamente.");
  const id = ++proximoId;
  return new Promise((resolve, reject) => {
    const limite = setTimeout(() => {
      atual.encerrar("O código demorou demais. Confira se os laços têm uma condição de parada.");
    }, 8000);
    atual.pendentes.set(id, {
      resolver: (resultado) => { clearTimeout(limite); resolve(resultado); },
      rejeitar: (erro) => { clearTimeout(limite); reject(erro); },
    });
    atual.porta.postMessage({ id, codigo, avaliador });
  });
}
