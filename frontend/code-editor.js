import { basicSetup, EditorView } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import { requisicaoAPI } from "./services/api";

function elemento(tag, classe, texto) {
  const no = document.createElement(tag);
  if (classe) no.className = classe;
  if (texto !== undefined) no.textContent = texto;
  return no;
}

function botao(classe, texto) {
  const no = elemento("button", classe, texto);
  no.type = "button";
  return no;
}

async function executarLocal(codigo, avaliador) {
  const { executarPython } = await import("./python-sandbox.js");
  return executarPython(codigo, avaliador);
}

export function criarEditorDeCodigo({ aula, usuario, concluido, aoAprovar }) {
  const exercicio = aula.exercicio;
  const linguagem = aula.linguagem || "python";
  const nome = linguagem === "java" ? "Java" : "Python 3";
  const painel = elemento("section", "interactive-exercise");
  const titulo = elemento("h2", "", exercicio.titulo || "Prática no editor");
  painel.append(titulo, elemento("p", "exercise-prompt", exercicio.enunciado));
  titulo.id = `exercicio-${exercicio.id}`;
  painel.setAttribute("aria-labelledby", titulo.id);

  const cabecalho = elemento("div", "exercise-toolbar");
  const botoes = elemento("div", "exercise-actions");
  const executar = botao("lesson-next exercise-run", "Executar código");
  const verificar = botao("lesson-next exercise-check", "Verificar exercício");
  const limpar = botao("lesson-previous", "Limpar");
  const restaurar = botao("lesson-previous", "Restaurar início");
  botoes.append(executar, verificar, limpar, restaurar);
  cabecalho.append(elemento("span", "exercise-language", nome), botoes);
  painel.append(cabecalho);

  const area = elemento("div", "exercise-codemirror");
  painel.append(area);
  const stdin = elemento("details", "exercise-stdin");
  const textoEntrada = elemento("textarea", "exercise-stdin-input");
  textoEntrada.id = `stdin-${exercicio.id}`;
  textoEntrada.rows = 3;
  textoEntrada.maxLength = 4000;
  textoEntrada.spellcheck = false;
  const label = elemento("label", "", "Digite um valor por linha, na ordem em que o programa pede.");
  label.htmlFor = textoEntrada.id;
  stdin.append(elemento("summary", "", "Entrada (stdin)"), label, textoEntrada);
  painel.append(stdin);

  const painelSaida = elemento("div", "exercise-console");
  const saida = elemento("pre", "exercise-output", "A saída do seu programa aparece aqui.");
  const erros = elemento("pre", "exercise-output exercise-stderr");
  erros.hidden = true;
  painelSaida.append(elemento("h3", "", "Saída do programa"), saida, erros);
  painel.append(painelSaida);

  const estado = elemento("p", "exercise-status", concluido ? "✓ Exercício concluído." : "");
  if (concluido) estado.classList.add("sucesso");
  estado.setAttribute("role", "status");
  const casos = elemento("div", "exercise-cases");
  const correcao = elemento("details", "exercise-solution");
  correcao.hidden = true;
  if (exercicio.correcao) {
    const bloco = elemento("pre");
    bloco.append(elemento("code", "", exercicio.correcao));
    correcao.append(elemento("summary", "", "Ver correção comentada"), bloco);
  }
  painel.append(estado, casos, correcao);

  const chave = `devcursos-exercicio-${usuario}-${exercicio.id}`;
  let doc = exercicio.codigoInicial || "";
  try { doc = localStorage.getItem(chave) ?? doc; } catch { /* O editor funciona sem rascunho. */ }

  const edicao = new Compartment();
  const view = new EditorView({
    doc,
    parent: area,
    extensions: [
      basicSetup,
      oneDark,
      linguagem === "java" ? java() : python(),
      edicao.of(EditorState.readOnly.of(false)),
      EditorView.contentAttributes.of({ "aria-label": `Código em ${nome}`, spellcheck: "false" }),
      keymap.of([{ key: "Mod-Enter", run: () => { void interagir(false); return true; } }]),
      EditorView.updateListener.of((atualizacao) => {
        if (!atualizacao.docChanged) return;
        try { localStorage.setItem(chave, atualizacao.state.doc.toString()); } catch { /* Rascunho indisponível. */ }
      }),
    ],
  });

  const abortador = new AbortController();
  let ocupado = false;
  function status(texto, tipo = "") {
    estado.textContent = texto;
    estado.className = `exercise-status ${tipo}`.trim();
  }
  function escrever(novo) {
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: novo } });
    textoEntrada.value = "";
    saida.textContent = "A saída do seu programa aparece aqui.";
    erros.hidden = true;
    erros.textContent = "";
    casos.replaceChildren();
    status(concluido ? "✓ Exercício concluído." : "", concluido ? "sucesso" : "");
    view.focus();
  }
  limpar.onclick = () => escrever("");
  restaurar.onclick = () => escrever(exercicio.codigoInicial || "");
  executar.onclick = () => void interagir(false);
  verificar.onclick = () => void interagir(true);

  function requisitar(rota, body, timeout) {
    return requisicaoAPI(rota, {
      method: "POST",
      body: JSON.stringify(body),
      signal: AbortSignal.any([abortador.signal, AbortSignal.timeout(timeout)]),
    });
  }

  async function execucaoLivre(codigo, entrada) {
    const resultado = await requisitar("/api/executar", { codigo, linguagem, entrada }, 18000);
    if (resultado.modo !== "navegador") return resultado;
    const entradas = entrada ? entrada.split(/\r?\n/) : [];
    if (entradas.at(-1) === "") entradas.pop();
    const [local] = await executarLocal(codigo, { tipo: "saida", mostrarPrompt: true, casos: [{ entradas }] });
    return { modo: "navegador", saida: local.valor, erro: local.erro, ok: !local.erro };
  }

  function mostrarCasos(registro) {
    const mostrarValor = (valor) => typeof valor === "string" ? valor || "(sem saída)" : JSON.stringify(valor);
    registro.casos.forEach((caso, indice) => {
      const item = elemento("section", "exercise-case");
      const dados = exercicio.avaliador?.casos[indice];
      const entrada = dados?.entradas ?? dados?.argumentos ?? [];
      item.append(elemento("h3", "", `Caso ${indice + 1} · ${caso.correto ? "Correto" : "Revise este caso"}`));
      if (entrada.length) item.append(elemento("p", "", `Dados do caso: ${entrada.map((valor) => JSON.stringify(valor)).join(", ")}`));
      if (caso.erro) {
        item.append(elemento("pre", "exercise-output exercise-stderr", caso.erro));
      } else {
        const rotulo = exercicio.avaliador?.tipo === "funcao" ? "Valor retornado" : "Saída do programa";
        item.append(elemento("p", "", rotulo), elemento("pre", "exercise-output", mostrarValor(caso.valor)));
      }
      if (Object.hasOwn(caso, "esperado")) {
        item.append(elemento("p", "", "Resultado esperado"), elemento("pre", "exercise-output", mostrarValor(caso.esperado)));
      }
      casos.append(item);
    });
  }

  async function interagir(corrigir) {
    if (ocupado) return;
    const codigo = view.state.doc.toString();
    if (!codigo.trim() || codigo.length > 12000) {
      status("Digite um código com até 12.000 caracteres.", "erro");
      view.focus();
      return;
    }

    const acionado = corrigir ? verificar : executar;
    const original = acionado.textContent;
    ocupado = executar.disabled = verificar.disabled = limpar.disabled = restaurar.disabled = textoEntrada.disabled = true;
    view.dispatch({ effects: edicao.reconfigure(EditorState.readOnly.of(true)) });
    acionado.textContent = corrigir ? "Verificando..." : "Executando...";
    status(corrigir ? "Conferindo os casos do exercício." : "Executando seu programa.");
    erros.hidden = true;
    casos.replaceChildren();

    try {
      if (!corrigir) {
        const resultado = await execucaoLivre(codigo, textoEntrada.value);
        if (abortador.signal.aborted) return;
        saida.textContent = resultado.saida || "(sem saída)";
        erros.textContent = resultado.erro || "";
        erros.hidden = !resultado.erro;
        const onde = resultado.modo === "remoto" ? "no servidor de execução" : "no navegador";
        status(resultado.ok ? `Programa executado ${onde}.` : "A execução encontrou um erro. Confira o console.", resultado.ok ? "sucesso" : "erro");
        return;
      }

      const dados = { exercicioId: exercicio.id, codigo };
      if (aula.modoExecucao === "navegador") {
        dados.resultados = await executarLocal(codigo, exercicio.avaliador);
      }
      const registro = await requisitar(`/aulas/${encodeURIComponent(aula.id)}/exercicio/tentativas`, dados, 20000);
      if (abortador.signal.aborted) return;
      mostrarCasos(registro);
      if (registro.aprovado) {
        concluido = true;
        status(`✓ Correto. Seu código passou em todos os ${registro.totalCasos} casos.`, "sucesso");
        aoAprovar();
      } else {
        status(`${registro.acertos} de ${registro.totalCasos} casos corretos. Confira as diferenças e tente novamente.`, "erro");
        correcao.hidden = !exercicio.correcao;
      }
    } catch (erro) {
      if (abortador.signal.aborted) return;
      status(erro.name === "TimeoutError" ? "A execução demorou demais. Tente novamente." : erro.message, "erro");
      if (erro.detalhe) {
        erros.textContent = erro.detalhe;
        erros.hidden = false;
        if (corrigir) correcao.hidden = !exercicio.correcao;
      }
    } finally {
      if (!abortador.signal.aborted) {
        ocupado = executar.disabled = verificar.disabled = limpar.disabled = restaurar.disabled = textoEntrada.disabled = false;
        view.dispatch({ effects: edicao.reconfigure(EditorState.readOnly.of(false)) });
        acionado.textContent = original;
      }
    }
  }

  return { painel, destruir: () => { abortador.abort(); view.destroy(); } };
}
