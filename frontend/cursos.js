import { auth } from "./firebase/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { requisicaoAPI, encerrarSessao } from "./services/api";

const PROVA = { id: "prova-final", titulo: "Avaliação final", minimoAcertos: 0 };
const LETRAS = ["A", "B", "C", "D", "E", "F"];

const tituloCurso = document.getElementById("tituloCurso");
const menu = document.getElementById("menu");
const pagina = document.getElementById("pagina");
const textoProg = document.getElementById("textoProg");
const btnReiniciar = document.getElementById("btnReiniciar");

let curso = null;
let todas = [];
let feitas = new Set();
let exerciciosConcluidos = new Set();
let avaliacoesAprovadas = new Set();
let avaliacaoAtualMeta = null;
let respostasProva = {};
let avaliacao = null;
let tentativaProva = null;
let destruirEditor = null;
let aulaAtualId = null;
let renderVersion = 0;
let provaCarregada = false;
let mensagemAvaliacao = "Esta avaliação ainda não está configurada.";
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
    exerciciosConcluidos = new Set(
      (dados.exerciciosConcluidos || []).map(String),
    );
    avaliacoesAprovadas = new Set(
      (dados.avaliacoesAprovadas || []).map(String),
    );
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

function chaveAvaliacao(avaliacao) {
  if (String(curso?.avaliacaoFinal?.id) === String(avaliacao.id)) return PROVA.id;
  return `avaliacao-${avaliacao.id}`;
}

function obterAvaliacaoPorChave(key) {
  return avaliacaoPorChave(key);
}

async function carregarAvaliacao(meta) {
  avaliacaoAtualMeta = meta;
  avaliacao = await requisicaoAPI(
    `/avaliacoes/${encodeURIComponent(meta.id)}`,
  );
  respostasProva = {};
  tentativaProva = null;
  PROVA.titulo = avaliacao.titulo || meta.titulo || "Avaliação";
  PROVA.minimoAcertos = Number(avaliacao.minimoAcertos || 0);
  provaCarregada = true;
  document.title = `${meta.titulo} | ${curso.titulo || "Formação"} | DevCursos+`;
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
  const texto = String(markdown ?? "").replace(/(?:\r\n|\r|\n)/g, "\n");
  // Separe o texto antes de tratar parágrafos. Linhas em branco dentro
  // de um bloco Python pertencem ao código.
  const partes = texto.split(/^ {0,3}```[^\n]*\n([\s\S]*?)^ {0,3}```[ \t]*$/gm);
  if (partes.length > 1) {
    return partes.map((parte, indice) =>
      indice % 2
        ? `<pre><code>${escaparHtml(parte.replace(/\n$/, ""))}</code></pre>`
        : renderizarMarkdown(parte),
    ).join("");
  }
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

      // --- ADICIONE ESTE BLOCO PARA RENDERIZAR VÍDEOS DO YOUTUBE ---
      const matchYoutube = blocoLimpo.match(
        /^!\[([^\]]*)\]\(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:[?&]([^\s)]*))?\)$/,
      );

      if (matchYoutube) {
        const titulo = escaparHtml(matchYoutube[1] || "Vídeo do YouTube");
        const videoId = matchYoutube[2];
        const paramsRaw = matchYoutube[3] || "";
        const params = new URLSearchParams(paramsRaw);

        // Converte &t=18s (link comum) para ?start=18 (padrão do player embed)
        if (params.has("t")) {
          const segundos = parseInt(params.get("t"), 10);
          if (!Number.isNaN(segundos)) {
            params.delete("t");
            params.set("start", String(segundos));
          }
        }
        params.delete("pp");

        const queryString = params.toString();
        const embedUrl = `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ""}`;

        return `<div class="video-wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:1.5rem 0;"><iframe src="${embedUrl}" title="${titulo}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }
      // -------------------------------------------------------------

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
            .join("\n"),
        ).replace(/\n/g, "<br>");
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

      // Aproveita para corrigir também o <br> que aparecia escrito nos parágrafos
      return `<p>${renderizarInlineMarkdown(bloco).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
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
        concluida ? (tipo === "avaliacao" ? "APROVADA" : "CONCLUÍDA")
          : bloqueada ? "BLOQUEADA" : tipo === "avaliacao" ? "AVALIAR" : "LIBERADA",
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
        titulo: meta.titulo || "Avaliação do módulo",
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
    corpo.innerHTML = renderizarMarkdown(conteudo);
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
      ? nextMeta ? "Abrir avaliação do módulo" : "Siga para a próxima aula"
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

function desenharProva(sec) {
  sec.replaceChildren();
  const meta = avaliacaoAtualMeta || {};
  sec.append(
    criarElemento("p", "trilha", meta.final ? "Avaliação final" : meta.moduloTitulo || "Avaliação do módulo"),
    criarElemento("h1", "", avaliacao?.titulo || meta.titulo || "Avaliação"),
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
        `${mensagemAvaliacao} As respostas serão corrigidas pelo servidor.`,
      ),
    );
    return;
  }

  sec.appendChild(
    criarElemento(
      "p",
      "",
      `Responda às questões para revisar os conceitos do módulo. Você precisa acertar pelo menos ${avaliacao.minimoAcertos} de ${avaliacao.questoes.length}.`,
    ),
  );

  avaliacao.questoes.forEach((questao, indice) => {
    const bloco = criarElemento("fieldset", "quiz-q");
    bloco.appendChild(
      criarElemento("legend", "", `${indice + 1}. ${questao.enunciado}`),
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
    const aprovada = Boolean(tentativaProva.aprovada);
    const resultado = criarElemento(
      "p",
      `quiz-resultado ${aprovada ? "sucesso" : "erro"}`,
      `${tentativaProva.acertos} de ${tentativaProva.totalQuestoes} acertos. ${aprovada ? "Avaliação aprovada." : "Ainda não atingiu o mínimo. Revise o conteúdo e tente de novo."}`,
    );
    sec.appendChild(resultado);
    if (!aprovada) {
      const tentar = criarElemento("button", "lesson-previous quiz-retry", "Tentar novamente");
      tentar.type = "button";
      tentar.dataset.acao = "tentar-avaliacao";
      sec.appendChild(tentar);
    } else {
      const nextKey = proximoItemAposAvaliacao(meta);
      if (nextKey) {
        const seguir = criarElemento(
          "button",
          "lesson-next assessment-next",
          nextKey === PROVA.id ? "Abrir avaliação final" : "Ir para o próximo módulo",
        );
        seguir.type = "button";
        seguir.dataset.proximaEtapa = nextKey;
        sec.appendChild(seguir);
      } else {
        sec.appendChild(criarElemento("p", "course-complete-note", "Curso concluído. Você pode revisar qualquer aula quando quiser."));
      }
    }
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

function criarSecaoProva(meta) {
  const sec = criarElemento("section", "aula-secao prova-secao");
  sec.id = "lesson-content";
  const key = chaveAvaliacao(meta);
  sec.dataset.key = key;

  if (!avaliacaoLiberada(meta)) {
    sec.classList.add("bloqueada");
    sec.append(
      criarElemento("p", "trilha", meta.final ? "Avaliação final" : meta.moduloTitulo || "Avaliação do módulo"),
      criarElemento("h1", "", meta.titulo || "Avaliação"),
      criarElemento(
        "p",
        "",
        meta.final ? "Conclua todas as aulas e as avaliações dos módulos para abrir a prova final." : "Conclua as aulas deste módulo e passe na avaliação anterior para continuar.",
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

    const tentar = alvo?.closest('[data-acao="tentar-avaliacao"]');
    if (tentar) {
      respostasProva = {};
      tentativaProva = null;
      desenharProva(sec);
      return;
    }

    const proxima = alvo?.closest("[data-proxima-etapa]");
    if (proxima) {
      void selecionarAula(proxima.dataset.proximaEtapa);
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
      if (tentativaProva.aprovada) {
        avaliacoesAprovadas.add(String(avaliacao.id));
        atualizarProgresso();
        montarMenu(aulaAtualId);
      }
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
    criarElemento("p", "section-kicker", "ACESSO EM ETAPAS"),
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
    criarElemento("span", "locked-content-line", "Etapa disponível depois da anterior"),
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
      await carregarAvaliacao(meta);
      if (versao !== renderVersion) return;
      pagina.replaceChildren(criarSecaoProva(meta));
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
