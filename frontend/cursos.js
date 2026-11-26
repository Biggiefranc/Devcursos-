import { auth } from "./firebase/firebase-config";
import { requisicaoAPI, encerrarSessao } from "./services/api";
import { renderizarMarkdown, renderizarInlineMarkdown } from "./services/markdown";

const PROVA = { id: "prova-final", titulo: "Avaliação final" };
const LETRAS = ["A", "B", "C", "D", "E", "F"];

const tituloCurso = document.getElementById("tituloCurso");
const menu = document.getElementById("menu");
const pagina = document.getElementById("pagina");
const textoProg = document.getElementById("textoProg");
const btnReiniciar = document.getElementById("btnReiniciar");
const curriculumToggle = document.getElementById("curriculumToggle");
const curriculumPanel = document.getElementById("curriculumPanel");
const curriculumCurrent = document.getElementById("curriculumCurrent");

function mostrarCurriculo(aberto) {
  curriculumToggle.setAttribute("aria-expanded", String(aberto));
}

curriculumToggle.addEventListener("click", () => {
  const abrir = curriculumToggle.getAttribute("aria-expanded") === "false";
  mostrarCurriculo(abrir);
  const atual = menu.querySelector('[aria-current="step"]');
  if (abrir && atual) {
    const painel = curriculumPanel.getBoundingClientRect();
    const cabecalho = curriculumPanel.querySelector(".curriculum-head");
    const topo = atual.getBoundingClientRect().top - painel.top;
    if (topo < cabecalho.offsetHeight || topo + atual.offsetHeight > painel.height) {
      curriculumPanel.scrollTop += topo - cabecalho.offsetHeight;
    }
  }
});

curriculumPanel.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || curriculumToggle.getAttribute("aria-expanded") !== "true") return;
  mostrarCurriculo(false);
  curriculumToggle.focus();
});

let curso = null;
let todas = [];
let feitas = new Set();
let exerciciosConcluidos = new Set();
let avaliacoesAprovadas = new Set();
let destruirEditor = null;
let aulaAtualId = null;
let renderVersion = 0;
const parametros = new URLSearchParams(window.location.search);
const cursoId = parametros.get("curso");
const aulaSolicitada =
  parametros.get("aula") ||
  (window.location.hash.match(/aula-(.+)/) || [])[1] ||
  "";

const brandLink = document.getElementById("brandLink");
const backLink = document.getElementById("backLink");

function atualizarLinksDeNavegacao() {
  if (brandLink) brandLink.href = "menudashbord.html";
  if (backLink) {
    backLink.href = cursoId
      ? "visualizarcurso.html?curso=" + encodeURIComponent(cursoId)
      : "catalogo.html";
    backLink.textContent = "Currículo";
  }
}

atualizarLinksDeNavegacao();

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

pagina.tabIndex = -1;

function redirecionarAoLogin() {
  const destino = window.location.pathname + window.location.search + window.location.hash;
  window.location.href = `login.html?redirect=${encodeURIComponent(destino)}`;
}

async function carregarConclusoes() {
  if (!auth.currentUser) {
    redirecionarAoLogin();
    throw new Error("É necessário entrar para consultar seu progresso.");
  }

  try {
    const dados = await requisicaoAPI(
      `/cursos/${encodeURIComponent(cursoId)}/progresso`,
    );
    feitas = new Set((dados.aulasConcluidas || []).map(String));
    exerciciosConcluidos = new Set(
      (dados.exerciciosConcluidos || []).map(String),
    );
    avaliacoesAprovadas = new Set(
      (dados.avaliacoesAprovadas || []).map(String),
    );
    localStorage.removeItem("devcursos-feitas");
  } catch (erro) {
    if (erro.status === 401) {
      await encerrarSessao();
      redirecionarAoLogin();
    }
    throw erro;
  }
}

async function salvarConclusaoDaAula(aulaId, concluida) {
  await requisicaoAPI(`/aulas/${encodeURIComponent(aulaId)}/conclusao`, {
    method: "PUT",
    body: JSON.stringify({ concluida }),
  });
}

function chaveAvaliacao(avaliacao) {
  if (String(curso?.avaliacaoFinal?.id) === String(avaliacao.id)) return PROVA.id;
  return `avaliacao-${avaliacao.id}`;
}

function obterAvaliacaoPorChave(key) {
  return avaliacaoPorChave(key);
}

function indiceDaAula(key) {
  return todas.findIndex((aula) => String(aula.id) === String(key));
}

function aulaLiberada(key) {
  const indice = indiceDaAula(key);
  if (indice === -1) return false;
  const aula = todas[indice];
  const aulasAnteriores = todas
    .slice(0, indice)
    .every((aula) => feitas.has(String(aula.id)));
  const avaliacoesAnteriores = curso.modulos
    .slice(0, aula.mi)
    .every((modulo) => !modulo.avaliacao || avaliacoesAprovadas.has(String(modulo.avaliacao.id)));
  return aulasAnteriores && avaliacoesAnteriores;
}

function avaliacaoLiberada(meta) {
  if (!meta) return false;
  if (meta.final || String(curso?.avaliacaoFinal?.id) === String(meta.id)) {
    return todas.length > 0
      && todas.every((aula) => feitas.has(String(aula.id)))
      && curso.modulos.every(
        (modulo) => !modulo.avaliacao || avaliacoesAprovadas.has(String(modulo.avaliacao.id)),
      );
  }
  const indexModulo = curso.modulos.findIndex(
    (modulo) => String(modulo.id) === String(meta.moduloId),
  );
  if (indexModulo < 0) return false;
  const modulo = curso.modulos[indexModulo];
  return (modulo.aulas || []).every((aula) => feitas.has(String(aula.id)))
    && curso.modulos.slice(0, indexModulo).every(
      (anterior) => !anterior.avaliacao || avaliacoesAprovadas.has(String(anterior.avaliacao.id)),
    );
}

function avaliacaoPorChave(key) {
  if (key === PROVA.id) {
    return curso?.avaliacaoFinal
      ? { ...curso.avaliacaoFinal, final: true }
      : null;
  }
  if (!String(key).startsWith("avaliacao-")) return null;
  const id = String(key).slice("avaliacao-".length);
  for (const modulo of curso?.modulos || []) {
    if (String(modulo.avaliacao?.id) === id) {
      return { ...modulo.avaliacao, moduloId: modulo.id, moduloTitulo: modulo.titulo };
    }
  }
  return null;
}

function proximoItemAposAula(indice) {
  const aula = todas[indice];
  if (!aula) return null;
  const modulo = curso.modulos[aula.mi];
  const ultimaAula = (modulo?.aulas || []).at(-1);
  if (ultimaAula && String(ultimaAula.id) === String(aula.id)) {
    if (modulo.avaliacao && !avaliacoesAprovadas.has(String(modulo.avaliacao.id))) {
      return chaveAvaliacao(modulo.avaliacao);
    }
    if (todas[indice + 1]) return String(todas[indice + 1].id);
    if (curso.avaliacaoFinal) return PROVA.id;
    return null;
  }
  return todas[indice + 1] ? String(todas[indice + 1].id) : null;
}

function proximoItemAposAvaliacao(meta) {
  if (meta.final || String(curso?.avaliacaoFinal?.id) === String(meta.id)) return null;
  const index = curso.modulos.findIndex(
    (modulo) => String(modulo.id) === String(meta.moduloId),
  );
  const moduloSeguinte = curso.modulos[index + 1];
  if (moduloSeguinte?.aulas?.length) return String(moduloSeguinte.aulas[0].id);
  return curso.avaliacaoFinal ? PROVA.id : null;
}

function primeiroItemPendente() {
  for (const modulo of curso.modulos) {
    const aula = (modulo.aulas || []).find(
      (item) => !feitas.has(String(item.id)),
    );
    if (aula) return String(aula.id);
    if (modulo.avaliacao && !avaliacoesAprovadas.has(String(modulo.avaliacao.id))) {
      return chaveAvaliacao(modulo.avaliacao);
    }
  }
  return curso.avaliacaoFinal
    ? PROVA.id
    : todas[0] ? String(todas[0].id) : null;
}

function provaLiberada() {
  return avaliacaoLiberada(curso?.avaliacaoFinal ? { ...curso.avaliacaoFinal, final: true } : null);
}

function atualizarProgresso() {
  const concluidos = todas.filter((a) => feitas.has(String(a.id))).length;
  const totalAvaliacoes = (curso?.modulos || []).filter((modulo) => modulo.avaliacao).length
    + (curso?.avaliacaoFinal ? 1 : 0);
  textoProg.textContent = `${concluidos} de ${todas.length} aulas · ${avaliacoesAprovadas.size} de ${totalAvaliacoes} avaliações`;
}

function primeiraAulaPendente() {
  return todas.find((aula) => !feitas.has(String(aula.id))) || null;
}

function moduloDaAula(key) {
  const aula = todas[indiceDaAula(key)];
  return curso.modulos.find(
    (modulo) => String(modulo.id) === String(aula?.modulo_id),
  );
}

function montarMenu(keyAtual = aulaAtualId) {
  tituloCurso.textContent = curso.titulo || "Curso";
  menu.replaceChildren();

  const criarBotao = ({ key, titulo, tipo, concluida, liberada }) => {
    const bloqueada = !liberada && !concluida;
    const botao = criarElemento(
      "button",
      "aula-btn" +
        (String(keyAtual) === String(key) ? " ativa" : "") +
        (concluida ? " concluida" : "") +
        (bloqueada ? " bloqueada" : "") +
        (tipo === "avaliacao" ? " avaliacao-btn" : ""),
    );
    botao.type = "button";
    botao.dataset.key = key;
    botao.setAttribute("aria-disabled", String(bloqueada));
    if (String(keyAtual) === String(key)) botao.setAttribute("aria-current", "step");
    const lessonIndex = tipo === "aula" ? indiceDaAula(key) : -1;
    botao.append(
      criarElemento(
        "span",
        "lesson-number",
        tipo === "avaliacao" ? "AV" : String(lessonIndex + 1).padStart(2, "0"),
      ),
      criarElemento("span", "aula-title", titulo),
      criarElemento(
        "span",
        "aula-status",
        concluida ? (tipo === "avaliacao" ? "Aprovada" : "Concluída")
          : bloqueada ? "Bloqueada" : "Disponível",
      ),
    );
    botao.addEventListener("click", () => {
      if (curriculumToggle.getAttribute("aria-expanded") === "true") {
        mostrarCurriculo(false);
        curriculumToggle.focus();
      }
      void selecionarAula(key);
    });
    return botao;
  };

  const criarModulo = (titulo, botoes, index) => {
    const box = criarElemento("div", "modulo");
    const botaoModulo = criarElemento("button", "modulo-btn");
    const lista = criarElemento("div", "aulas");
    lista.id = `modulo-aulas-${index + 1}`;
    botaoModulo.classList.add("curriculum-module-toggle");
    botaoModulo.setAttribute("aria-controls", lista.id);
    const moduloAtivo = botoes.some(
      (botao) => String(botao.dataset.key) === String(keyAtual),
    );
    botaoModulo.setAttribute("aria-expanded", String(moduloAtivo));
    botaoModulo.type = "button";
    botaoModulo.append(
      criarElemento("span", "module-number", String(index + 1).padStart(2, "0")),
      criarElemento("span", "module-title", titulo),
    );
    botaoModulo.addEventListener("click", () => {
      const aberto = box.classList.toggle("aberto");
      botaoModulo.setAttribute("aria-expanded", String(aberto));
    });
    lista.append(...botoes);
    box.append(botaoModulo, lista);
    if (moduloAtivo || (!keyAtual && index === 0)) box.classList.add("aberto");
    menu.appendChild(box);
  };

  curso.modulos.forEach((modulo, mi) => {
    const botoes = modulo.aulas.map((aula) => criarBotao({
      key: String(aula.id),
      titulo: aula.titulo || "Aula",
      tipo: "aula",
      concluida: feitas.has(String(aula.id)),
      liberada: aulaLiberada(String(aula.id)),
    }));
    if (modulo.avaliacao) {
      const meta = { ...modulo.avaliacao, moduloId: modulo.id, moduloTitulo: modulo.titulo };
      botoes.push(criarBotao({
        key: chaveAvaliacao(meta),
        titulo: "Avaliação do módulo",
        tipo: "avaliacao",
        concluida: avaliacoesAprovadas.has(String(meta.id)),
        liberada: avaliacaoLiberada(meta),
      }));
    }
    criarModulo(
      modulo.titulo || `Módulo ${mi + 1}`,
      botoes,
      mi,
    );
  });

  if (curso.avaliacaoFinal) {
    const meta = { ...curso.avaliacaoFinal, final: true };
    criarModulo("Avaliação final", [criarBotao({
      key: PROVA.id,
      titulo: meta.titulo || PROVA.titulo,
      tipo: "avaliacao",
      concluida: avaliacoesAprovadas.has(String(meta.id)),
      liberada: provaLiberada(),
    })], curso.modulos.length);
  }
}

function criarSecaoAula(aula, modulo, criarEditorDeCodigo) {
  const key = String(aula.id);
  const sec = criarElemento("section", "aula-secao");
  sec.id = "lesson-content";
  sec.dataset.key = key;

  sec.append(
    criarElemento("p", "trilha", modulo.titulo || ""),
    criarElemento("h1", "", aula.titulo || ""),
  );
  sec.querySelector("h1")?.setAttribute("tabindex", "-1");
  if (Number(aula.duracao_minutos) > 0) {
    sec.appendChild(
      criarElemento(
        "p",
        "lesson-duration",
        "TEMPO DE ESTUDO · " + Number(aula.duracao_minutos) + " MIN",
      ),
    );
  }

  const corpo = criarElemento("div", "corpo-aula");
  const conteudo = String(aula.conteudo ?? "");
  if (conteudo.trim()) {
    corpo.append(renderizarMarkdown(conteudo));
  } else {
    corpo.appendChild(
      criarElemento("p", "", "Esta aula ainda não possui conteúdo cadastrado."),
    );
  }
  sec.appendChild(corpo);

  const index = indiceDaAula(key);
  const nextKey = proximoItemAposAula(index);
  const nextMeta = obterAvaliacaoPorChave(nextKey);
  const advance = criarElemento(
    "button",
    "lesson-next",
    nextKey
      ? nextMeta
        ? nextMeta.final ? "Abrir avaliação final" : "Abrir avaliação do módulo"
        : "Siga para a próxima aula"
      : "Formação concluída",
  );
  advance.type = "button";
  advance.disabled = Boolean(
    aula.exercicio && !feitas.has(key) && !exerciciosConcluidos.has(key),
  );

  if (aula.exercicio) {
    const editor = criarEditorDeCodigo({
      aula,
      usuario: auth.currentUser?.uid,
      concluido: exerciciosConcluidos.has(key),
      aoAprovar: () => {
        exerciciosConcluidos.add(key);
        advance.disabled = false;
        sec.querySelector(".lesson-step-note")?.remove();
      },
    });
    const referencia = Array.from(corpo.children).find(
      (elemento) => elemento.textContent.trim().startsWith("Documentação oficial:"),
    );
    if (referencia) referencia.before(editor.painel);
    else sec.append(editor.painel);
    destruirEditor = editor.destruir;
  }

  const footer = criarElemento("nav", "lesson-navigation");
  footer.setAttribute("aria-label", "Navegação entre aulas");
  const previous = index > 0 ? todas[index - 1] : null;
  if (previous) {
    const back = criarElemento("button", "lesson-previous", "Aula anterior");
    back.type = "button";
    back.addEventListener("click", () => void selecionarAula(previous.id));
    footer.appendChild(back);
  } else {
    const curriculum = criarElemento("a", "lesson-previous", "Voltar ao currículo");
    curriculum.href = "visualizarcurso.html?curso=" + encodeURIComponent(cursoId);
    footer.appendChild(curriculum);
  }

  advance.addEventListener("click", async () => {
    if (advance.disabled) return;
    advance.disabled = true;
    try {
      if (!feitas.has(key)) {
        await salvarConclusaoDaAula(key, true);
        feitas.add(key);
        atualizarProgresso();
        montarMenu(key);
      }
      if (nextKey) {
        await selecionarAula(nextKey);
      } else {
        sec.appendChild(
          criarElemento("p", "course-complete-note", "Você concluiu esta formação. Pode voltar às aulas para revisar quando quiser."),
        );
      }
    } catch (error) {
      console.error("Não foi possível avançar a aula:", error);
      if (error.status === 409 || error.status === 403) await carregarConclusoes();
      montarMenu(key);
      sec.prepend(criarElemento("p", "lesson-save-error", error.message));
      advance.disabled = Boolean(
        aula.exercicio && !feitas.has(key) && !exerciciosConcluidos.has(key),
      );
    }
  });
  footer.appendChild(advance);
  sec.appendChild(footer);
  if (aula.exercicio && !feitas.has(key) && !exerciciosConcluidos.has(key)) {
    sec.appendChild(
      criarElemento(
        "p",
        "lesson-step-note",
        "Passe pelos casos de verificação no editor para liberar a próxima etapa.",
      ),
    );
  }
  return sec;
}

function criarSecaoProva(meta, avaliacao) {
  const sec = criarElemento("section", "aula-secao prova-secao");
  sec.id = "lesson-content";
  sec.dataset.key = chaveAvaliacao(meta);

  const titulo = criarElemento("h1", "", avaliacao.titulo || meta.titulo || "Avaliação");
  titulo.tabIndex = -1;
  sec.append(
    criarElemento("p", "trilha", meta.final ? "Avaliação final" : meta.moduloTitulo || "Avaliação do módulo"),
    titulo,
  );

  const total = avaliacao.questoes.length;
  const tema = meta.final ? "do curso" : "do módulo";
  sec.appendChild(criarElemento(
    "p", "quiz-intro",
    `Revise os conceitos ${tema}. Para passar, acerte pelo menos ${avaliacao.minimoAcertos} de ${total} questões.`,
  ));

  const formulario = criarElemento("form", "quiz-form");
  const questoes = avaliacao.questoes.map((questao, indice) => {
    const bloco = criarElemento("fieldset", "quiz-q");
    const grupo = `questao-${questao.id}`;
    const legenda = criarElemento("legend");
    legenda.append(renderizarInlineMarkdown(`${indice + 1}. ${questao.enunciado}`));
    bloco.appendChild(legenda);

    const opcoes = criarElemento("div", "quiz-options");
    questao.alternativas.forEach((alternativa, alternativaIndice) => {
      const rotulo = criarElemento("label", "quiz-op");
      const radio = criarElemento("input", "quiz-radio");
      radio.type = "radio";
      radio.name = grupo;
      radio.value = String(alternativa.id);
      radio.required = true;
      const letra = criarElemento("span", "quiz-letra", LETRAS[alternativaIndice] || String(alternativaIndice + 1));
      letra.setAttribute("aria-hidden", "true");
      const texto = criarElemento("span");
      texto.append(renderizarInlineMarkdown(alternativa.texto));
      rotulo.append(radio, letra, texto);
      opcoes.appendChild(rotulo);
    });
    bloco.appendChild(opcoes);
    formulario.appendChild(bloco);
    return bloco;
  });

  const rodape = criarElemento("div", "quiz-actions");
  const status = criarElemento("p", "quiz-status");
  status.setAttribute("role", "status");
  const enviar = criarElemento("button", "lesson-next quiz-submit", "Enviar avaliação");
  enviar.type = "submit";
  rodape.append(status, enviar);
  formulario.appendChild(rodape);
  sec.appendChild(formulario);

  let enviando = false;

  function atualizarContagem() {
    const totalRespondidas = Array.from(new FormData(formulario).keys()).length;
    status.className = "quiz-status";
    status.textContent = `${totalRespondidas} de ${total} respondidas`;
    enviar.disabled = totalRespondidas < total;
  }

  formulario.addEventListener("change", atualizarContagem);
  atualizarContagem();

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (enviar.disabled || enviando) return;

    const dados = new FormData(formulario);
    const respostas = avaliacao.questoes.map((questao) => ({
      questaoId: Number(questao.id),
      alternativaId: Number(dados.get(`questao-${questao.id}`)),
    }));
    enviando = true;
    enviar.disabled = true;
    questoes.forEach((bloco) => { bloco.disabled = true; });
    status.textContent = "Enviando respostas…";

    try {
      const tentativa = await requisicaoAPI(
        `/avaliacoes/${encodeURIComponent(avaliacao.id)}/tentativas`,
        { method: "POST", body: JSON.stringify({ respostas }) },
      );

      if (tentativa.aprovada) {
        avaliacoesAprovadas.add(String(avaliacao.id));
        atualizarProgresso();
        montarMenu(aulaAtualId);
      }
      if (!sec.isConnected) return;

      const revisar = new Set(tentativa.questoesParaRevisar || []);
      questoes.forEach((bloco, indice) => {
        if (revisar.has(avaliacao.questoes[indice].id)) {
          bloco.appendChild(criarElemento("p", "quiz-revisao", "Revise esta questão."));
        }
      });

      const mensagem = tentativa.aprovada
        ? "Avaliação aprovada."
        : "Revise o conteúdo e tente novamente.";
      status.textContent = `${tentativa.acertos} de ${tentativa.totalQuestoes} acertos. ${mensagem}`;
      status.className = `quiz-status ${tentativa.aprovada ? "sucesso" : "erro"}`;
      enviar.hidden = true;
      status.tabIndex = -1;
      status.focus();

      if (!tentativa.aprovada) {
        const tentar = criarElemento("button", "lesson-previous", "Tentar novamente");
        tentar.type = "button";
        tentar.addEventListener("click", () => {
          formulario.reset();
          questoes.forEach((bloco) => {
            bloco.disabled = false;
            bloco.querySelector(".quiz-revisao")?.remove();
          });
          tentar.remove();
          enviar.hidden = false;
          atualizarContagem();
          questoes[0]?.querySelector("input")?.focus();
        });
        rodape.appendChild(tentar);
        return;
      }

      const proximaEtapa = proximoItemAposAvaliacao(meta);
      if (proximaEtapa) {
        const texto = proximaEtapa === PROVA.id ? "Abrir avaliação final" : "Ir para o próximo módulo";
        const seguir = criarElemento("button", "lesson-next", texto);
        seguir.type = "button";
        seguir.addEventListener("click", () => void selecionarAula(proximaEtapa));
        rodape.appendChild(seguir);
      } else {
        rodape.appendChild(criarElemento("p", "course-complete-note", "Formação concluída. Você pode voltar às aulas para revisar."));
      }
    } catch (erro) {
      if (!sec.isConnected) return;
      questoes.forEach((bloco) => { bloco.disabled = false; });
      atualizarContagem();
      status.className = "quiz-status erro";
      status.textContent = erro.message || "Não foi possível enviar a avaliação. Tente novamente.";
    } finally {
      enviando = false;
    }
  });
  return sec;
}

function atualizarHistoricoAula(key, modo) {
  if (!modo) return;
  const url = new URL(window.location.href);
  url.searchParams.set("aula", String(key));
  url.hash = "";
  window.history[modo === "replace" ? "replaceState" : "pushState"](
    { aula: String(key) },
    "",
    url,
  );
}

function criarAulaBloqueada(key, mensagemServidor = "") {
  const index = indiceDaAula(key);
  const aula = todas[index];
  const meta = obterAvaliacaoPorChave(key);
  const necessaria = index >= 0
    ? todas.slice(0, index).find((item) => !feitas.has(String(item.id)))
    : primeiraAulaPendente();
  const module = aula ? moduloDaAula(key) : null;
  let mensagem = mensagemServidor;
  if (!mensagem && meta?.final) {
    const avaliacaoPendente = curso.modulos.find(
      (item) => item.avaliacao && !avaliacoesAprovadas.has(String(item.avaliacao.id)),
    );
    mensagem = avaliacaoPendente
      ? `Aprove a avaliação de “${avaliacaoPendente.titulo}” antes da prova final.`
      : "Conclua todas as aulas antes da avaliação final.";
  } else if (!mensagem && meta) {
    const moduloAvaliacao = curso.modulos.find(
      (item) => String(item.id) === String(meta.moduloId),
    );
    const aulaPendente = (moduloAvaliacao?.aulas || []).find(
      (item) => !feitas.has(String(item.id)),
    );
    mensagem = aulaPendente
      ? `Conclua “${aulaPendente.titulo}” antes da avaliação deste módulo.`
      : "Aprove a avaliação do módulo anterior para continuar.";
  }
  const section = criarElemento("section", "lesson-locked");
  section.setAttribute("role", "status");
  section.append(
    criarElemento("h1", "", meta ? "Avaliação ainda bloqueada." : "Esta aula ainda está bloqueada."),
    criarElemento(
      "p",
      "lesson-lock-message",
      mensagem || (necessaria
        ? `Conclua “${necessaria.titulo}” para liberar a próxima etapa.`
        : "Conclua as etapas anteriores para continuar."),
    ),
  );
  section.querySelector("h1")?.setAttribute("tabindex", "-1");

  const preview = criarElemento("div", "lesson-locked-preview");
  preview.setAttribute("aria-hidden", "true");
  preview.append(
    criarElemento("span", "section-kicker", module?.titulo || meta?.moduloTitulo || "CURRÍCULO"),
    criarElemento("strong", "", aula?.titulo || meta?.titulo || PROVA.titulo),
  );
  section.appendChild(preview);

  const itemLiberado = primeiroItemPendente();
  if (itemLiberado && itemLiberado !== key) {
    const action = criarElemento("button", "lesson-next", "Ir para a etapa liberada");
    action.type = "button";
    action.addEventListener("click", () => void selecionarAula(itemLiberado));
    section.appendChild(action);
  }
  return section;
}

async function selecionarAula(key, { historyMode = "push", focar = true } = {}) {
  const id = String(key);
  const meta = obterAvaliacaoPorChave(id);
  if (!meta && indiceDaAula(id) < 0) return;
  if (id === aulaAtualId && historyMode === "push") return;

  curriculumCurrent.textContent = meta?.titulo || todas[indiceDaAula(id)]?.titulo || "Conteúdo do curso";
  curriculumToggle.hidden = false;
  mostrarCurriculo(false);
  destruirEditor?.();
  destruirEditor = null;
  aulaAtualId = id;
  renderVersion += 1;
  const versao = renderVersion;
  atualizarHistoricoAula(id, historyMode);
  montarMenu(id);
  pagina.setAttribute("aria-busy", "true");
  pagina.replaceChildren();

  if (meta && !avaliacaoLiberada(meta)) {
    pagina.appendChild(criarAulaBloqueada(id));
    if (focar) pagina.querySelector("h1")?.focus({ preventScroll: true });
    pagina.removeAttribute("aria-busy");
    return;
  }
  if (!meta && !aulaLiberada(id)) {
    pagina.appendChild(criarAulaBloqueada(id));
    if (focar) pagina.querySelector("h1")?.focus({ preventScroll: true });
    pagina.removeAttribute("aria-busy");
    return;
  }

  pagina.innerHTML =
    '<div class="detail-skeleton" aria-label="Carregando conteúdo"><span class="skeleton-line short"></span><span class="skeleton-line wide"></span><span class="skeleton-line medium"></span><span class="skeleton-block"></span></div>';

  try {
    if (meta) {
      const avaliacao = await requisicaoAPI(`/avaliacoes/${encodeURIComponent(meta.id)}`);
      if (versao !== renderVersion) return;
      pagina.replaceChildren(criarSecaoProva(meta, avaliacao));
      document.title = `${avaliacao.titulo || meta.titulo} | ${curso.titulo || "Formação"} | DevCursos+`;
    } else {
      const lesson = await requisicaoAPI(
        "/aulas/" + encodeURIComponent(id),
      );
      if (versao !== renderVersion) return;
      const module = curso.modulos.find(
        (item) => String(item.id) === String(lesson.modulo_id),
      );
      if (!module) throw new Error("O módulo desta aula não foi encontrado.");
      const editor = lesson.exercicio ? await import("./code-editor.js") : null;
      if (versao !== renderVersion) return;
      pagina.replaceChildren(criarSecaoAula(lesson, module, editor?.criarEditorDeCodigo));
      document.title =
        lesson.titulo + " | " + (curso.titulo || "Formação") + " | DevCursos+";
    }
    const areaRolagem = pagina.closest(".lesson-main");
    if (areaRolagem) areaRolagem.scrollTop = 0;
    if (focar) {
      pagina.querySelector("h1")?.focus({ preventScroll: true });
    }
  } catch (error) {
    if (versao !== renderVersion) return;
    if (error.status === 409 || error.status === 403) {
      try {
        await carregarConclusoes();
      } catch (progressError) {
        console.warn("Não foi possível atualizar o progresso.", progressError);
      }
      montarMenu(id);
      pagina.replaceChildren(criarAulaBloqueada(id, error.message));
    } else {
      mostrarErro(error.message || "Não foi possível carregar esta aula.");
    }
  } finally {
    if (versao === renderVersion) pagina.removeAttribute("aria-busy");
  }
}

window.addEventListener("popstate", () => {
  const key = new URLSearchParams(window.location.search).get("aula");
  if (key) void selecionarAula(key, { historyMode: null, focar: false });
});

btnReiniciar.addEventListener("click", async () => {
  if (!confirm("Zerar todo o progresso deste curso?")) return;
  btnReiniciar.disabled = true;

  try {
    await requisicaoAPI(
      "/cursos/" + encodeURIComponent(cursoId) + "/progresso",
      { method: "DELETE" },
    );
    feitas = new Set();
    exerciciosConcluidos = new Set();
    avaliacoesAprovadas = new Set();
    localStorage.removeItem("devcursos-feitas");
    atualizarProgresso();
    await selecionarAula(todas[0]?.id, { historyMode: "replace" });
  } catch (erro) {
    console.error("Erro ao reiniciar progresso:", erro);
    alert(
      "Não foi possível reiniciar todo o progresso. Os dados do servidor não foram substituídos localmente.",
    );
    try {
      await carregarConclusoes();
    } catch (erroAtualizacao) {
      console.error(
        "Não foi possível recarregar o progresso:",
        erroAtualizacao,
      );
    }
    atualizarProgresso();
    if (aulaAtualId) await selecionarAula(aulaAtualId, { historyMode: "replace" });
  } finally {
    btnReiniciar.disabled = false;
  }
});

function mostrarErro(mensagem) {
  tituloCurso.textContent = "Conteúdo indisponível";
  const texto = String(mensagem).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
  pagina.innerHTML =
    '<div class="inline-error"><p>' +
    texto +
    '</p><a class="button button-outline" href="catalogo.html">Voltar ao catálogo</a></div>';
  pagina.removeAttribute("aria-busy");
}

async function iniciarCurso() {
  if (!cursoId) {
    pagina.innerHTML =
      '<div class="inline-error"><p>Nenhuma formação foi selecionada.</p><a class="button button-outline" href="catalogo.html">Abrir catálogo</a></div>';
    return;
  }

  try {
    const [curriculum] = await Promise.all([
      requisicaoAPI(
        "/cursos/" + encodeURIComponent(cursoId) + "/estrutura",
        { autenticada: false },
      ),
      carregarConclusoes(),
    ]);
    curso = curriculum;
    curso.modulos = Array.isArray(curso.modulos) ? curso.modulos : [];
    tituloCurso.textContent = curso.titulo || "Formação";
    const lessonsCount = curso.modulos.reduce(
      (sum, module) => sum + (module.aulas || []).length,
      0,
    );
    const curriculumCount = document.getElementById("curriculumCount");
    if (curriculumCount)
      curriculumCount.textContent =
        curso.modulos.length + " módulos · " + lessonsCount + " aulas";

    todas = [];
    curso.modulos.forEach((modulo, mi) => {
      modulo.aulas = Array.isArray(modulo.aulas) ? modulo.aulas : [];
      modulo.aulas.forEach((aula) => todas.push({ ...aula, mi }));
    });

    if (!todas.length) {
      pagina.innerHTML =
        '<div class="inline-error"><p>Esta formação ainda não tem aulas publicadas.</p><a class="button button-outline" href="visualizarcurso.html?curso=' +
        encodeURIComponent(cursoId) +
        '">Voltar ao currículo</a></div>';
      return;
    }

    atualizarProgresso();
    const hashAula = window.location.hash.match(/^#aula-(.+)$/)?.[1] || "";
    const solicitada = aulaSolicitada || hashAula;
    const target =
      obterAvaliacaoPorChave(solicitada) || indiceDaAula(solicitada) >= 0
        ? solicitada
        : primeiroItemPendente();
    await selecionarAula(target, { historyMode: "replace", focar: false });
  } catch (erro) {
    console.error("Erro ao carregar a formação:", erro);
    mostrarErro(
      "Não foi possível carregar o conteúdo. " + (erro.message || ""),
    );
  }
}

auth.authStateReady()
  .then(async () => {
    if (!auth.currentUser) {
      redirecionarAoLogin();
      return;
    }
    await iniciarCurso();
  })
  .catch((erro) => {
    console.error("Não foi possível iniciar a área de aprendizagem:", erro);
    mostrarErro(erro.message || "Não foi possível carregar o curso.");
  });
