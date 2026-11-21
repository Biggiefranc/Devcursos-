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
let mensagemAvaliacao =
  "Esta avaliação ainda não foi configurada para o curso.";

const parametros = new URLSearchParams(window.location.search);
const cursoId = parametros.get("curso");
const aulaSelecionada =
  parametros.get("aula") ||
  (window.location.hash.match(/aula-(.+)/) || [])[1] ||
  "";

const brandLink = document.getElementById("brandLink");
const backLink = document.getElementById("backLink");

function atualizarLinksDeNavegacao() {
  if (brandLink) brandLink.href = "menudashbord.html";
  if (backLink) backLink.href = "menudashbord.html";
}

atualizarLinksDeNavegacao();

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

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
  respostasProva = {};
  tentativaProva = null;
  avaliacao = null;
  mensagemAvaliacao = "Esta avaliação ainda não foi configurada para o curso.";
  localStorage.removeItem(`devcursos-prova-${cursoId}`);

  try {
    avaliacao = await requisicaoAPI(
      `/cursos/${encodeURIComponent(cursoId)}/avaliacao`,
    );
    PROVA.titulo = avaliacao.titulo || "Avaliação final";
    PROVA.minimoAcertos = Number(avaliacao.minimoAcertos || 0);
  } catch (erro) {
    if (erro.status === 404 || erro.status === 409) {
      mensagemAvaliacao = erro.message || mensagemAvaliacao;
      return;
    }
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

function idDaSecao(key) {
  return key === PROVA.id ? "prova-final" : `aula-${key}`;
}

function indiceDaAula(key) {
  return todas.findIndex((aula) => String(aula.id) === String(key));
}

function ultimaAulaLiberada() {
  let ultimo = -1;
  for (let i = 0; i < todas.length; i += 1) {
    if (feitas.has(String(todas[i].id))) {
      ultimo = i;
    } else {
      break;
    }
  }
  return ultimo;
}

function aulaLiberada(key) {
  const indice = indiceDaAula(key);
  if (indice === -1) return false;
  return indice <= ultimaAulaLiberada() + 1;
}

function provaLiberada() {
  return todas.length > 0 && todas.every((aula) => feitas.has(String(aula.id)));
}

function atualizarProgresso() {
  const total = Math.max(todas.length, 1);
  const concluidos = todas.filter((a) => feitas.has(String(a.id))).length;
  textoProg.textContent = concluidos + " de " + total + " aulas concluídas";
}

function atualizarUI(key) {
  document.querySelectorAll(".aula-btn").forEach((b) => {
    if (b.dataset.key !== key) return;
    const feita = feitas.has(String(key));
    b.classList.toggle("concluida", feita);
    const status = b.querySelector(".aula-status");
    if (status) status.textContent = feita ? "CONCLUÍDA" : "";
  });
  atualizarProgresso();
}

async function concluirAula(key) {
  const chave = String(key);
  if (chave === PROVA.id) {
    alert("A avaliação deste curso ainda não foi configurada no servidor.");
    return;
  }

  if (feitas.has(chave)) return;
  if (!aulaLiberada(chave)) {
    alert("Complete a aula anterior para desbloquear esta etapa.");
    return;
  }

  const botao = document.querySelector(
    `.btn-concluir[data-key="${CSS.escape(chave)}"]`,
  );
  if (botao) botao.disabled = true;

  try {
    const token = await tokenAtual();
    if (!token)
      throw new Error(
        "Sua sessão expirou. Entre novamente para salvar o progresso.",
      );

    // O servidor confirma a gravação antes que a interface altere o estado.
    await salvarConclusaoDaAula(chave, true);
    feitas.add(chave);
    atualizarUI(chave);
    montarMenu();
    renderTudo();
  } catch (erro) {
    console.error("Não foi possível salvar a conclusão da aula:", erro);
    alert(
      erro.message || "Não foi possível salvar seu progresso. Tente novamente.",
    );
    if (botao) botao.disabled = false;
  }
}

function destacarNaLateral(key) {
  document.querySelectorAll(".aula-btn").forEach((b) => {
    b.classList.toggle("ativa", String(b.dataset.key) === String(key));
    if (String(b.dataset.key) === String(key)) {
      const modulo = b.closest(".modulo");
      modulo?.classList.add("aberto");
      modulo
        ?.querySelector(".modulo-btn")
        ?.setAttribute("aria-expanded", "true");
    }
  });
}

function montarMenu() {
  tituloCurso.textContent = curso.titulo || "Curso";
  menu.replaceChildren();

  const criarBotaoAula = (key, titulo) => {
    const bloqueada = key !== PROVA.id ? !aulaLiberada(key) : !provaLiberada();
    const concluida = feitas.has(String(key));
    const botao = criarElemento(
      "button",
      "aula-btn" +
        (concluida ? " concluida" : "") +
        (bloqueada ? " bloqueada" : ""),
    );
    botao.type = "button";
    botao.dataset.key = key;
    botao.disabled = bloqueada && !concluida;
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
      criarElemento("span", "aula-status", concluida ? "CONCLUÍDA" : ""),
    );
    botao.addEventListener("click", () => {
      if (key === PROVA.id) {
        if (!provaLiberada()) {
          alert(
            "Você precisa concluir todas as aulas antes da avaliação final.",
          );
          return;
        }
      } else if (!aulaLiberada(key)) {
        alert("Complete a aula anterior para desbloquear esta etapa.");
        return;
      }

      const secaoId = idDaSecao(key);
      window.location.hash = secaoId;
      document
        .getElementById(secaoId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    botaoModulo.setAttribute("aria-expanded", String(index === 0));
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
    if (index === 0) box.classList.add("aberto");
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
  sec.id = idDaSecao(key);
  sec.dataset.key = key;

  const bloqueada = !aulaLiberada(key);
  if (bloqueada) {
    sec.classList.add("bloqueada");
  }

  sec.append(
    criarElemento("p", "trilha", modulo.titulo || ""),
    criarElemento("h1", "", aula.titulo || ""),
  );

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

  const acao = criarElemento("button", "btn-concluir", "Concluir aula");
  acao.type = "button";
  acao.dataset.acao = "concluir-aula";
  acao.dataset.key = key;
  acao.disabled = bloqueada || feitas.has(key);
  if (feitas.has(key)) {
    acao.textContent = "Aula concluída";
  }
  acao.addEventListener("click", async () => {
    await concluirAula(key);
  });
  sec.appendChild(acao);
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
  sec.id = idDaSecao(PROVA.id);
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

function renderTudo() {
  pagina.replaceChildren();
  curso.modulos.forEach((modulo, mi) => {
    pagina.appendChild(
      criarElemento("h2", "modulo-head", modulo.titulo || `Módulo ${mi + 1}`),
    );
    modulo.aulas.forEach((aula) =>
      pagina.appendChild(criarSecaoAula(aula, modulo)),
    );
  });
  pagina.appendChild(criarSecaoProva());

  document.querySelectorAll(".aula-secao").forEach((secao) => {
    if (secao.dataset.key && secao.dataset.key !== PROVA.id) {
      observador.observe(secao);
    }
  });
}

const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((en) => {
      if (!en.isIntersecting) return;
      const key = en.target.dataset.key;
      if (key) destacarNaLateral(key);
    });
  },
  { root: null, rootMargin: "-68px 0px -55% 0px", threshold: 0 },
);

btnReiniciar.addEventListener("click", async () => {
  if (!confirm("Zerar todo o progresso deste curso?")) return;
  btnReiniciar.disabled = true;

  try {
    await Promise.all(
      todas.map((aula) =>
        requisicaoAPI("/aulas/" + encodeURIComponent(aula.id) + "/conclusao", {
          method: "PUT",
          body: JSON.stringify({ concluida: false }),
        }),
      ),
    );
    feitas = new Set();
    respostasProva = {};
    tentativaProva = null;
    localStorage.removeItem("devcursos-feitas");
    await carregarProva();
    montarMenu();
    renderTudo();
    atualizarProgresso();
    location.hash = "";
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
    montarMenu();
    renderTudo();
    atualizarProgresso();
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
}

async function iniciarCurso() {
  if (!cursoId) {
    pagina.innerHTML =
      '<div class="inline-error"><p>Nenhuma formação foi selecionada.</p><a class="button button-outline" href="catalogo.html">Abrir catálogo</a></div>';
    return;
  }

  try {
    const contentPromise = requisicaoAPI(
      "/cursos/" + encodeURIComponent(cursoId) + "/conteudo",
    );
    const progressPromise = carregarConclusoes();
    const assessmentPromise = carregarProva();
    curso = await contentPromise;
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
            void Promise.allSettled([progressPromise, assessmentPromise]);
      pagina.innerHTML =
        '<div class="inline-error"><p>Esta formação ainda não tem aulas publicadas.</p><a class="button button-outline" href="visualizarcurso.html?curso=' +
        encodeURIComponent(cursoId) +
        '">Voltar ao currículo</a></div>';
      return;
    }

    await Promise.all([progressPromise, assessmentPromise]);
    montarMenu();
    renderTudo();

    const alvo = decodeURIComponent(
      aulaSelecionada ||
        (window.location.hash.match(/aula-(.+)/) || [])[1] ||
        "",
    );
    if (alvo) {
      const secao = document.getElementById("aula-" + alvo);
      if (secao) {
        window.setTimeout(
          () => secao.scrollIntoView({ behavior: "smooth", block: "start" }),
          160,
        );
        destacarNaLateral(alvo);
      }
    }
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
      const destino = `cursos.html?curso=${encodeURIComponent(cursoId || "")}`;
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
