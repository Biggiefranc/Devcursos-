import { auth } from "./firebase/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { requisicaoAPI, encerrarSessao } from "./services/api";

/* A correção da avaliação é feita exclusivamente pelo Back-End. */
const PROVA = {
  id: "prova-final",
  titulo: "Avaliação final",
  minimoAcertos: 0,
};
const LETRAS = ["A", "B", "C", "D", "E", "F"];

const tituloCurso = document.getElementById("tituloCurso");
const menu = document.getElementById("menu");
const pagina = document.getElementById("pagina");
const textoProg = document.getElementById("textoProg");
const btnReiniciar = document.getElementById("btnReiniciar");

let curso = null;
let todas = [];
let feitas = new Set();
let respostasProva = {};
let avaliacao = null;
let tentativaProva = null;
let aulaAtualId = null;
let renderVersion = 0;
let provaCarregada = false;
let mensagemAvaliacao =
  "Esta avaliação ainda não foi configurada para o curso.";

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

async function tokenAtual() {
  if (auth.currentUser) {
    return auth.currentUser.getIdToken();
  }

  const salvo = localStorage.getItem("devcursos_token");
  return salvo || null;
}

async function carregarConclusoes() {
  const token = await tokenAtual();
  if (!token) {
    const destino = `cursos.html?curso=${encodeURIComponent(cursoId)}`;
    window.location.href = `login.html?redirect=${encodeURIComponent(destino)}`;
    throw new Error("É necessário entrar para consultar seu progresso.");
  }

  try {
    const dados = await requisicaoAPI(
      `/cursos/${encodeURIComponent(cursoId)}/progresso`,
    );
    feitas = new Set((dados.aulasConcluidas || []).map(String));
    localStorage.removeItem("devcursos-feitas");
  } catch (erro) {
    if (erro.status === 401) {
      localStorage.removeItem("devcursos_token");
      localStorage.removeItem("devcursos_user");
      await encerrarSessao();
      const destino = `cursos.html?curso=${encodeURIComponent(cursoId)}`;
      window.location.href = `login.html?redirect=${encodeURIComponent(destino)}`;
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

/* A avaliação e as tentativas são consultadas/enviadas ao servidor. */
async function carregarProva() {
  if (provaCarregada) return;
  mensagemAvaliacao = "Esta avaliação ainda não foi configurada para o curso.";

  try {
    avaliacao = await requisicaoAPI(
      `/cursos/${encodeURIComponent(cursoId)}/avaliacao`,
    );
    provaCarregada = true;
    PROVA.titulo = avaliacao.titulo || "Avaliação final";
    PROVA.minimoAcertos = Number(avaliacao.minimoAcertos || 0);
    montarMenu(PROVA.id);
    document.title = `${PROVA.titulo} | ${curso.titulo || "Formação"} | DevCursos+`;
  } catch (erro) {
    if (erro.status === 404 || erro.status === 409) {
      provaCarregada = true;
      mensagemAvaliacao = erro.message || mensagemAvaliacao;
      return;
    }
    provaCarregada = false;
    throw erro;
  }
}

/* ----- Renderização ----- */
function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderizarInlineMarkdown(texto) {
  const tokens = [];
  const proteger = (html) => {
    const indice = tokens.push(html) - 1;
    return `\u0001${indice}\u0001`;
  };

  let valor = escaparHtml(texto)
    .replace(/`([^`]+)`/g, (_, codigo) => proteger(`<code>${codigo}</code>`))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, rotulo, url) =>
      proteger(
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${rotulo}</a>`,
      ),
    );

  valor = valor
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );

  return valor.replace(
    /\u0001(\d+)\u0001/g,
    (_, indice) => tokens[Number(indice)] || "",
  );
}

function renderizarMarkdown(markdown) {
  const texto = String(markdown ?? "").replace(/\r\n/g, "\n");
  const blocos = texto.split(/\n\s*\n/).filter((bloco) => bloco.trim());

  return blocos
    .map((bloco) => {
      const linhas = bloco.split("\n");

      if (linhas.every((linha) => /^```/.test(linha.trim()))) {
        return "";
      }

      if (linhas[0]?.trim().startsWith("```")) {
        const codigo = linhas
          .slice(1)
          .filter((linha) => !/^```$/.test(linha.trim()))
          .join("\n");
        return `<pre><code>${escaparHtml(codigo)}</code></pre>`;
      }

      const blocoLimpo = bloco.trim();

      if (/^#{1,6}[ \t]+/.test(blocoLimpo)) {
        const match = blocoLimpo.match(
          /^(#{1,6})[ \t]+([^\n]*)(?:\n([\s\S]*))?$/,
        );

        if (match) {
          const nivel = Math.min(match[1].length + 1, 6);
          const titulo = renderizarInlineMarkdown(match[2].trim());
          const restante = match[3]?.trim();

          const htmlTitulo = `<h${nivel}>${titulo}</h${nivel}>`;

          return htmlTitulo + (restante ? renderizarMarkdown(restante) : "");
        }
      }

      if (/^>\s*/.test(bloco.trim())) {
        const conteudo = renderizarInlineMarkdown(
          bloco
            .split("\n")
            .map((linha) => linha.replace(/^>\s?/, "").trim())
            .filter(Boolean)
            .join("<br>"),
        );
        return `<blockquote>${conteudo}</blockquote>`;
      }

      const itens = bloco
        .split("\n")
        .filter(
          (linha) =>
            /^[-*]\s+/.test(linha.trim()) || /^\d+\.\s+/.test(linha.trim()),
        );

      if (itens.length) {
        const htmlLista = itens
          .map((linha) => {
            const textoLinha = linha.replace(/^\s*[-*]\s+|^\s*\d+\.\s+/, "");
            return `<li>${renderizarInlineMarkdown(textoLinha)}</li>`;
          })
          .join("");
        return `<ul>${htmlLista}</ul>`;
      }

      return `<p>${renderizarInlineMarkdown(bloco.replace(/\n/g, "<br>"))}</p>`;
    })
    .join("");
}

function indiceDaAula(key) {
  return todas.findIndex((aula) => String(aula.id) === String(key));
}

function aulaLiberada(key) {
  const indice = indiceDaAula(key);
  if (indice === -1) return false;
  return todas
    .slice(0, indice)
    .every((aula) => feitas.has(String(aula.id)));
}

function provaLiberada() {
  return todas.length > 0 && todas.every((aula) => feitas.has(String(aula.id)));
}

function atualizarProgresso() {
  const concluidos = todas.filter((a) => feitas.has(String(a.id))).length;
  textoProg.textContent = concluidos + " de " + todas.length + " aulas concluídas";
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

  const criarBotaoAula = (key, titulo) => {
    const bloqueada = key !== PROVA.id ? !aulaLiberada(key) : !provaLiberada();
    const concluida = feitas.has(String(key));
    const botao = criarElemento(
      "button",
      "aula-btn" +
        (String(keyAtual) === String(key) ? " ativa" : "") +
        (concluida ? " concluida" : "") +
        (bloqueada ? " bloqueada" : ""),
    );
    botao.type = "button";
    botao.dataset.key = key;
    botao.setAttribute("aria-disabled", String(bloqueada && !concluida));
    if (String(keyAtual) === String(key)) botao.setAttribute("aria-current", "step");
    if (bloqueada && !concluida) {
      const index = indiceDaAula(key);
      const required = index >= 0
        ? todas.slice(0, index).find((aula) => !feitas.has(String(aula.id)))
        : primeiraAulaPendente();
      botao.title = required
        ? "Conclua “" + required.titulo + "” para desbloquear."
        : "Conclua as aulas anteriores para desbloquear.";
    }
    const lessonIndex = todas.findIndex(
      (lesson) => String(lesson.id) === String(key),
    );
    botao.append(
      criarElemento(
        "span",
        "lesson-number",
        lessonIndex >= 0 ? String(lessonIndex + 1).padStart(2, "0") : "AV",
      ),
      criarElemento("span", "aula-title", titulo),
      criarElemento(
        "span",
        "aula-status",
        concluida ? "CONCLUÍDA" : bloqueada ? "BLOQUEADA" : "LIBERADA",
      ),
    );
    botao.addEventListener("click", () => {
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
    criarModulo(
      modulo.titulo || `Módulo ${mi + 1}`,
      modulo.aulas.map((aula) =>
        criarBotaoAula(String(aula.id), aula.titulo || "Aula"),
      ),
      mi,
    );
  });

  criarModulo(
    "Avaliação final",
    [criarBotaoAula(PROVA.id, PROVA.titulo)],
    curso.modulos.length,
  );
}

function criarSecaoAula(aula, modulo) {
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
        "DURAÇÃO ESTIMADA · " + Number(aula.duracao_minutos) + " MIN",
      ),
    );
  }

  const corpo = criarElemento("div", "corpo-aula");
  const conteudo = String(aula.conteudo ?? "");
  if (conteudo.trim()) {
    corpo.innerHTML = renderizarMarkdown(conteudo);
  } else {
    corpo.appendChild(
      criarElemento("p", "", "Esta aula ainda não possui conteúdo cadastrado."),
    );
  }
  sec.appendChild(corpo);

  const footer = criarElemento("nav", "lesson-navigation");
  footer.setAttribute("aria-label", "Navegação entre aulas");
  const index = indiceDaAula(key);
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

  const next = todas[index + 1];
  const advance = criarElemento(
    "button",
    "lesson-next",
    next ? "Siga para a próxima aula" : "Finalizar formação",
  );
  advance.type = "button";
  advance.addEventListener("click", async () => {
    advance.disabled = true;
    try {
      if (!feitas.has(key)) {
        await salvarConclusaoDaAula(key, true);
        feitas.add(key);
        atualizarProgresso();
        montarMenu(key);
      }
      await selecionarAula(next ? next.id : PROVA.id);
    } catch (error) {
      console.error("Não foi possível avançar a aula:", error);
      if (error.status === 409) await carregarConclusoes();
      montarMenu(key);
      pagina.prepend(criarElemento("p", "lesson-save-error", error.message));
      advance.disabled = false;
    }
  });
  footer.appendChild(advance);
  sec.appendChild(footer);
  if (!feitas.has(key)) {
    sec.appendChild(
      criarElemento(
        "p",
        "lesson-step-note",
        "Ao avançar, esta aula será registrada como concluída.",
      ),
    );
  }
  return sec;
}

function desenharProva(sec) {
  sec.replaceChildren();
  sec.append(
    criarElemento("p", "trilha", "Avaliação final"),
    criarElemento("h1", "", PROVA.titulo),
  );

  if (
    !avaliacao ||
    !Array.isArray(avaliacao.questoes) ||
    !avaliacao.questoes.length
  ) {
    sec.appendChild(
      criarElemento(
        "p",
        "",
        `${mensagemAvaliacao} O sistema não exibirá uma prova genérica nem aceitará aprovação registrada apenas no navegador.`,
      ),
    );
    return;
  }

  sec.appendChild(
    criarElemento(
      "p",
      "",
      `Responda todas as questões. É necessário acertar pelo menos ${PROVA.minimoAcertos} questão(ões). A correção será feita pelo servidor.`,
    ),
  );

  avaliacao.questoes.forEach((questao, indice) => {
    const bloco = criarElemento("div", "quiz-q");
    bloco.appendChild(
      criarElemento("h3", "", `${indice + 1}. ${questao.enunciado}`),
    );
    const selecionada = String(respostasProva[String(questao.id)] || "");
    (questao.alternativas || []).forEach((alternativa, alternativaIndice) => {
      const botao = criarElemento(
        "button",
        `quiz-op${selecionada === String(alternativa.id) ? " escolhida" : ""}`,
        `${LETRAS[alternativaIndice] || alternativaIndice + 1}. ${alternativa.texto}`,
      );
      botao.type = "button";
      botao.dataset.questaoId = String(questao.id);
      botao.dataset.alternativaId = String(alternativa.id);
      botao.disabled = Boolean(tentativaProva);
      bloco.appendChild(botao);
    });
    sec.appendChild(bloco);
  });

  if (tentativaProva) {
    const resultado = criarElemento(
      "p",
      "quiz-resultado",
      `${tentativaProva.acertos} de ${tentativaProva.totalQuestoes} acertos. ${tentativaProva.aprovada ? "Avaliação aprovada." : "Avaliação não aprovada."}`,
    );
    sec.appendChild(resultado);
    return;
  }

  const botaoEnviar = criarElemento(
    "button",
    "btn-concluir quiz-submit",
    "Enviar avaliação",
  );
  botaoEnviar.type = "button";
  botaoEnviar.dataset.acao = "enviar-prova";
  botaoEnviar.disabled = avaliacao.questoes.some(
    (questao) => !respostasProva[String(questao.id)],
  );
  sec.appendChild(botaoEnviar);
}

function criarSecaoProva() {
  const sec = criarElemento("section", "aula-secao prova-secao");
  sec.id = "lesson-content";
  sec.dataset.key = PROVA.id;

  if (!provaLiberada()) {
    sec.classList.add("bloqueada");
    sec.append(
      criarElemento("p", "trilha", "Avaliação final"),
      criarElemento("h1", "", PROVA.titulo),
      criarElemento(
        "p",
        "",
        "Finalize todas as aulas antes de acessar a avaliação final.",
      ),
    );
    return sec;
  }

  sec.addEventListener("click", async (evento) => {
    const alvo =
      evento.target instanceof Element
        ? evento.target
        : evento.target?.parentElement;
    const opcao = alvo?.closest(".quiz-op");
    if (opcao && sec.contains(opcao) && !tentativaProva) {
      respostasProva[opcao.dataset.questaoId] = opcao.dataset.alternativaId;
      desenharProva(sec);
      return;
    }

    const enviar = alvo?.closest('[data-acao="enviar-prova"]');
    if (!enviar || !avaliacao || tentativaProva) return;
    enviar.disabled = true;
    try {
      const respostas = Object.entries(respostasProva).map(
        ([questaoId, alternativaId]) => ({
          questaoId: Number(questaoId),
          alternativaId: Number(alternativaId),
        }),
      );
      tentativaProva = await requisicaoAPI(
        `/avaliacoes/${encodeURIComponent(avaliacao.id)}/tentativas`,
        {
          method: "POST",
          body: JSON.stringify({ respostas }),
        },
      );
      desenharProva(sec);
    } catch (erro) {
      console.error("Não foi possível enviar a avaliação:", erro);
      alert(
        erro.message || "Não foi possível enviar a avaliação. Tente novamente.",
      );
      enviar.disabled = false;
    }
  });

  desenharProva(sec);
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
  const necessaria =
    index >= 0
      ? todas.slice(0, index).find((item) => !feitas.has(String(item.id)))
      : primeiraAulaPendente();
  const module = aula ? moduloDaAula(key) : null;
  const section = criarElemento("section", "lesson-locked");
  section.setAttribute("role", "status");
  section.append(
    criarElemento("p", "section-kicker", "ACESSO EM ETAPAS"),
    criarElemento("h1", "", "Esta aula ainda está bloqueada."),
    criarElemento(
      "p",
      "lesson-lock-message",
      mensagemServidor ||
        (necessaria
          ? "Conclua “" + necessaria.titulo + "” para liberar a próxima aula."
          : "Conclua as aulas anteriores para continuar."),
    ),
  );
  section.querySelector("h1")?.setAttribute("tabindex", "-1");

  const preview = criarElemento("div", "lesson-locked-preview");
  preview.setAttribute("aria-hidden", "true");
  preview.append(
    criarElemento("span", "section-kicker", module?.titulo || "CURRÍCULO"),
    criarElemento("strong", "", aula?.titulo || PROVA.titulo),
    criarElemento("span", "locked-content-line", "Conteúdo disponível após a aula anterior"),
  );
  section.appendChild(preview);

  if (necessaria) {
    const action = criarElemento("button", "lesson-next", "Ir para a aula liberada");
    action.type = "button";
    action.addEventListener("click", () => void selecionarAula(necessaria.id));
    section.appendChild(action);
  }
  return section;
}

async function selecionarAula(key, { historyMode = "push", focar = true } = {}) {
  const id = String(key);
  if (id !== PROVA.id && indiceDaAula(id) < 0) return;
  if (id === aulaAtualId && historyMode === "push") return;

  aulaAtualId = id;
  renderVersion += 1;
  const versao = renderVersion;
  atualizarHistoricoAula(id, historyMode);
  montarMenu(id);
  pagina.setAttribute("aria-busy", "true");
  pagina.replaceChildren();

  if (id === PROVA.id && !provaLiberada()) {
    pagina.appendChild(criarAulaBloqueada(id));
    if (focar) pagina.querySelector("h1")?.focus({ preventScroll: true });
    pagina.removeAttribute("aria-busy");
    return;
  }
  if (id !== PROVA.id && !aulaLiberada(id)) {
    pagina.appendChild(criarAulaBloqueada(id));
    if (focar) pagina.querySelector("h1")?.focus({ preventScroll: true });
    pagina.removeAttribute("aria-busy");
    return;
  }

  pagina.innerHTML =
    '<div class="detail-skeleton" aria-label="Carregando conteúdo"><span class="skeleton-line short"></span><span class="skeleton-line wide"></span><span class="skeleton-line medium"></span><span class="skeleton-block"></span></div>';

  try {
    if (id === PROVA.id) {
      await carregarProva();
      if (versao !== renderVersion) return;
      pagina.replaceChildren(criarSecaoProva());
    } else {
      const lesson = await requisicaoAPI(
        "/aulas/" + encodeURIComponent(id),
      );
      if (versao !== renderVersion) return;
      const module = curso.modulos.find(
        (item) => String(item.id) === String(lesson.modulo_id),
      );
      if (!module) throw new Error("O módulo desta aula não foi encontrado.");
      pagina.replaceChildren(criarSecaoAula(lesson, module));
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
    if (error.status === 409 || (id === PROVA.id && error.status === 403)) {
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
    respostasProva = {};
    tentativaProva = null;
    avaliacao = null;
    provaCarregada = false;
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
      solicitada === PROVA.id || indiceDaAula(solicitada) >= 0
        ? solicitada
        : primeiraAulaPendente()?.id || PROVA.id;
    await selecionarAula(target, { historyMode: "replace", focar: false });
  } catch (erro) {
    console.error("Erro ao carregar a formação:", erro);
    mostrarErro(
      "Não foi possível carregar o conteúdo. " + (erro.message || ""),
    );
  }
}

const aguardarAuth = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (usuario) => {
    unsubscribe();
    resolve(usuario);
  });
});

aguardarAuth
  .then(async (usuario) => {
    if (!usuario) {
      localStorage.removeItem("devcursos_token");
      const destino = window.location.pathname + window.location.search;
      window.location.href = `login.html?redirect=${encodeURIComponent(destino)}`;
      return;
    }
    localStorage.setItem("devcursos_token", await usuario.getIdToken());
    await iniciarCurso();
  })
  .catch((erro) => {
    console.error("Não foi possível iniciar a área de aprendizagem:", erro);
    mostrarErro(erro.message || "Não foi possível carregar o curso.");
  });
