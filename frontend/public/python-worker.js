const PYODIDE_VERSION = "v314.0.8";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

let runtimePromise;

async function obterRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      const { loadPyodide } = await import(`${PYODIDE_BASE}pyodide.mjs`);
      const pyodide = await loadPyodide({ indexURL: PYODIDE_BASE });
      await pyodide.runPythonAsync(verificador);
      return pyodide;
    })();
  }
  return runtimePromise;
}

const verificador = `
import builtins
import contextlib
import io
import json

class __SaidaLimitada(io.StringIO):
    def write(self, texto):
        if self.tell() + len(texto) > 8000:
            raise RuntimeError("A saída passou de 8.000 caracteres. Reduza os prints e tente novamente.")
        return super().write(texto)

def __executar_codigo(codigo, entradas):
    saida = __SaidaLimitada()
    respostas = iter(entradas)
    entrada_original = builtins.input

    def entrada_de_teste(prompt=""):
        print(prompt, end="")
        try:
            return str(next(respostas))
        except StopIteration:
            raise EOFError("O programa pediu mais dados do que o exercício fornece.")

    espaco = {"__name__": "__main__"}
    builtins.input = entrada_de_teste
    try:
        with contextlib.redirect_stdout(saida):
            exec(compile(codigo, "<seu programa>", "exec"), espaco, espaco)
    finally:
        builtins.input = entrada_original
    return saida.getvalue().rstrip("\\n")

def __executar_funcao(codigo, nome, argumentos):
    espaco = {"__name__": "__main__"}
    exec(compile(codigo, "<seu programa>", "exec"), espaco, espaco)
    funcao = espaco.get(nome)
    if not callable(funcao):
        raise NameError("Crie uma função chamada '" + nome + "'.")
    return funcao(*argumentos)

def __verificar(codigo, avaliador):
    casos = avaliador["casos"]
    resultados = []
    saidas = []
    for indice, caso in enumerate(casos):
        if avaliador["tipo"] == "saida":
            obtida = __executar_codigo(codigo, caso.get("entradas", []))
            saidas.append(obtida)
            passou = obtida == caso["saida_esperada"]
        else:
            obtida = __executar_funcao(codigo, avaliador["nome_funcao"], caso["argumentos"])
            saidas.append(repr(obtida))
            passou = obtida == caso["resultado_esperado"]
        resultados.append({"caso": indice + 1, "passou": bool(passou)})

    passou = all(item["passou"] for item in resultados)
    mensagem = (
        "Todos os casos passaram. Seu algoritmo resolveu o exercício."
        if passou
        else "Ainda há um caso diferente do esperado. Revise os passos do algoritmo e tente novamente."
    )
    return json.dumps({
        "passou": passou,
        "total": len(resultados),
        "acertos": sum(1 for item in resultados if item["passou"]),
        "resultados": resultados,
        "saidas": saidas,
        "mensagem": mensagem,
    }, ensure_ascii=False)
`;

async function executar(codigo, avaliador) {
  const pyodide = await obterRuntime();
  const avaliadorPython = pyodide.toPy(avaliador);
  let resposta;
  let funcao;

  try {
    funcao = pyodide.globals.get("__verificar");
    resposta = funcao(codigo, avaliadorPython);
    return JSON.parse(resposta.toString());
  } finally {
    resposta?.destroy?.();
    funcao?.destroy?.();
    avaliadorPython.destroy();
  }
}

obterRuntime()
  .then(() => self.postMessage({ tipo: "pronto" }))
  .catch((erro) => self.postMessage({ tipo: "falha", mensagem: erro.message }));

self.addEventListener("message", async (evento) => {
  const { id, codigo, avaliador } = evento.data || {};
  try {
    const resultado = await executar(codigo, avaliador);
    self.postMessage({ id, resultado });
  } catch (erro) {
    self.postMessage({ id, erro: erro.message || "Não foi possível verificar o código." });
  }
});
