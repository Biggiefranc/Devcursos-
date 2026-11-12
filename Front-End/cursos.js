import { auth } from "./firebase/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { API_URL, requisicaoAPI, encerrarSessao } from "./services/api";

/* ===================== PROVA FINAL =====================
   Por enquanto as questões ficam aqui no código.
   Depois que o banco estiver pronto, troque por uma chamada à API.
   "correta": índice da alternativa (0 = A, 1 = B, 2 = C, 3 = D).
   ======================================================= */
const PROVA = {
    id: "prova-final",
    titulo: "Prova final",
    minimoAcertos: 6,
    questoes: [
        { pergunta: "Qual função mostra um texto na tela em Python?", opcoes: ["echo", "print", "console.log", "printf"], correta: 1 },
        { pergunta: "Como se define o bloco de código dentro de um if?", opcoes: ["Com chaves { }", "Com ponto e vírgula", "Com recuo (indentação)", "Com begin e end"], correta: 2 },
        { pergunta: "Qual é a extensão padrão de arquivos Python?", opcoes: [".py", ".pt", ".python", ".pyt"], correta: 0 },
        { pergunta: "Qual é o resultado de print(2 + 3)?", opcoes: ["23", "5", "2 + 3", "Erro"], correta: 1 },
        { pergunta: "Qual símbolo começa um comentário em Python?", opcoes: ["//", "/*", "#", "--"], correta: 2 },
        { pergunta: "Qual é a saída de print('Hello, world!')?", opcoes: ["Hello, world!", "'Hello, world!'", "Hello", "Nada aparece"], correta: 0 },
        { pergunta: "Qual é o tipo de dado de idade = 17?", opcoes: ["str", "int", "float", "bool"], correta: 1 },
        { pergunta: "Qual comando instala um pacote com o pip?", opcoes: ["pip install nome", "install pip nome", "pip add nome", "python get nome"], correta: 0 },
        { pergunta: "Qual dos valores abaixo é uma string?", opcoes: ["10", "True", '"texto"', "3.5"], correta: 2 },
        { pergunta: "O que o comando if faz?", opcoes: ["Repete o código", "Executa um bloco quando a condição é verdadeira", "Define uma função", "Importa um módulo"], correta: 1 }
    ]
};
const LETRAS = ["A", "B", "C", "D"];

const tituloCurso = document.getElementById("tituloCurso");
const menu = document.getElementById("menu");
const pagina = document.getElementById("pagina");
const barraProg = document.getElementById("barraProg");
const textoProg = document.getElementById("textoProg");
const btnReiniciar = document.getElementById("btnReiniciar");

let curso = null;
let todas = [];
let feitas = new Set();
let respostasProva = {};
let provaAprovada = false;

const parametros = new URLSearchParams(window.location.search);
const cursoId = parametros.get("curso");
const aulaSelecionada = parametros.get("aula") || (window.location.hash.match(/aula-(.+)/) || [])[1] || "";

async function buscarJson(url) {
    const resposta = await fetch(url);
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        throw new Error(dados?.mensagem || `Erro na requisição: ${resposta.status}`);
    }
    return dados;
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function tokenAtual() {
    return auth.currentUser;
}

function carregarConclusoesLocais() {
    try {
        feitas = new Set(JSON.parse(localStorage.getItem("devcursos-feitas") || "[]").map(String));
    } catch {
        feitas = new Set();
    }
}

function salvarConclusoesLocais() {
    try {
        localStorage.setItem("devcursos-feitas", JSON.stringify([...feitas]));
    } catch (erro) {
        console.error("Não foi possível salvar as conclusões locais:", erro);
    }
}

async function carregarConclusoes() {
    const token = await tokenAtual();
    if (!token) {
        carregarConclusoesLocais();
        return;
    }

    try {
        const dados = await requisicaoAPI(
            `/cursos/${encodeURIComponent(cursoId)}/progresso`
        );
        feitas = new Set((dados.aulasConcluidas || []).map(String));
        salvarConclusoesLocais();
    } catch (erro) {
        if (erro.status === 401) {
            console.warn("Sessão expirada ou ainda não revalidada. Usando progresso local.");
            carregarConclusoesLocais();
            return;
        }

        console.error("Não foi possível sincronizar o progresso com a API:", erro);
        carregarConclusoesLocais();
    }
}

async function salvarConclusaoDaAula(aulaId, concluida) {
    await requisicaoAPI(`/aulas/${encodeURIComponent(aulaId)}/conclusao`, {
        method: "PUT",
        body: JSON.stringify({ concluida })
    });
}

/* ----- Prova: estado salvo no navegador (cache até o banco existir) ----- */
function chaveProvaStorage() {
    return `devcursos-prova-${cursoId}`;
}

function carregarProva() {
    try {
        const salvo = JSON.parse(localStorage.getItem(chaveProvaStorage()) || "null");
        if (salvo) {
            respostasProva = salvo.respostas || {};
            provaAprovada = !!salvo.aprovada;
        }
    } catch {
        respostasProva = {};
        provaAprovada = false;
    }
    if (provaAprovada) feitas.add(PROVA.id);
}

function salvarProva() {
    try {
        localStorage.setItem(chaveProvaStorage(), JSON.stringify({ respostas: respostasProva, aprovada: provaAprovada }));
    } catch (erro) {
        console.error("Não foi possível salvar a prova:", erro);
    }
}

function respostaDe(i) {
    return respostasProva[i];
}

function contarAcertos() {
    return PROVA.questoes.filter((q, i) => respostaDe(i) === q.correta).length;
}

/* ----- Renderização ----- */
function renderizarMarkdown(markdown) {
    const texto = String(markdown ?? "");
    const escapeHtml = (valor) => valor
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return texto
        .split(/\n{2,}/)
        .map((bloco) => {
            const linhas = bloco
                .split(/\n/)
                .map((linha) => escapeHtml(linha).replace(/\s{2,}/g, " ").trim())
                .filter(Boolean)
                .join("<br>");

            return linhas ? `<p>${linhas}</p>` : "";
        })
        .join("");
}

function idDaSecao(key) {
    return key === PROVA.id ? "prova-final" : `aula-${key}`;
}

function atualizarProgresso() {
    const total = todas.length + 1;
    const concluidos = todas.filter(a => feitas.has(String(a.id))).length + (feitas.has(PROVA.id) ? 1 : 0);
    const pct = total ? Math.round(concluidos / total * 100) : 0;
    barraProg.style.width = pct + "%";
    textoProg.textContent = `${concluidos} de ${total} itens concluídos (${pct}%)`;
}

// Atualiza a lateral (check e destaque) e a barra, depois de uma conclusão
function atualizarUI(key) {
    document.querySelectorAll(".aula-btn").forEach(b => {
        if (b.dataset.key !== key) return;
        const feita = feitas.has(key);
        b.classList.toggle("concluida", feita);
        b.querySelector(".check").textContent = feita ? "✓" : "";
    });
    atualizarProgresso();
}

// Aula vista = concluída. A prova não entra aqui: conta só quando é aprovada.
async function marcarVista(key) {
    if (key === PROVA.id || feitas.has(key)) return;
    feitas.add(key);
    salvarConclusoesLocais();
    atualizarUI(key);
    if (tokenAtual()) {
        try {
            await salvarConclusaoDaAula(key, true);
        } catch (erro) {
            console.error("Não foi possível salvar a conclusão da aula:", erro);
        }
    }
}

function destacarNaLateral(key) {
    document.querySelectorAll(".aula-btn").forEach(b => {
        b.classList.toggle("ativa", b.dataset.key === key);
        if (b.dataset.key === key) b.closest(".modulo")?.classList.add("aberto");
    });
}

function montarMenu() {
    tituloCurso.textContent = curso.titulo || "Curso";
    menu.replaceChildren();

    const criarBotaoAula = (key, titulo) => {
        const botao = criarElemento("button", "aula-btn" + (feitas.has(key) ? " concluida" : ""));
        botao.type = "button";
        botao.dataset.key = key;
        botao.append(
            criarElemento("span", "check", feitas.has(key) ? "✓" : ""),
            criarElemento("span", "", titulo)
        );
        botao.addEventListener("click", () => {
            const secaoId = idDaSecao(key);
            window.location.hash = secaoId;
            document.getElementById(secaoId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return botao;
    };

    const criarModulo = (titulo, botoes) => {
        const box = criarElemento("div", "modulo");
        const botaoModulo = criarElemento("button", "modulo-btn");
        botaoModulo.type = "button";
        botaoModulo.append(criarElemento("span", "", titulo), criarElemento("span", "seta", "▶"));
        botaoModulo.addEventListener("click", () => box.classList.toggle("aberto"));
        const lista = criarElemento("div", "aulas");
        lista.append(...botoes);
        box.append(botaoModulo, lista);
        menu.appendChild(box);
    };

    curso.modulos.forEach((modulo, mi) => {
        criarModulo(
            modulo.titulo || `Módulo ${mi + 1}`,
            modulo.aulas.map(aula => criarBotaoAula(String(aula.id), aula.titulo || "Aula"))
        );
    });

    criarModulo("Avaliação final", [criarBotaoAula(PROVA.id, PROVA.titulo)]);
}

function criarSecaoAula(aula, modulo) {
    const key = String(aula.id);
    const sec = criarElemento("section", "aula-secao");
    sec.id = idDaSecao(key);
    sec.dataset.key = key;

    sec.append(
        criarElemento("p", "trilha", modulo.titulo || ""),
        criarElemento("h1", "", aula.titulo || "")
    );

    const corpo = criarElemento("div", "corpo-aula");
    const conteudo = String(aula.conteudo ?? "");
    if (conteudo.trim()) {
        corpo.innerHTML = renderizarMarkdown(conteudo);
    } else {
        corpo.appendChild(criarElemento("p", "", "Esta aula ainda não possui conteúdo cadastrado."));
    }
    sec.appendChild(corpo);
    return sec;
}

function desenharProva(sec) {
    const total = PROVA.questoes.length;
    sec.replaceChildren();

    sec.append(
        criarElemento("p", "trilha", "Avaliação final"),
        criarElemento("h1", "", PROVA.titulo),
        criarElemento("p", "", `Responda as ${total} questões. Para passar, você precisa acertar pelo menos ${PROVA.minimoAcertos}.`)
    );

    // Cubos: mostram só a letra que o aluno escolheu, conforme responde (sem gabarito)
    const cubos = criarElemento("div", "cubos");
    PROVA.questoes.forEach((_, i) => {
        const r = respostaDe(i);
        const respondido = r !== undefined;
        cubos.appendChild(
            criarElemento("span", "cubo" + (respondido ? " respondido" : ""),
                respondido ? `${i + 1}${LETRAS[r]}` : String(i + 1))
        );
    });
    sec.appendChild(cubos);

    PROVA.questoes.forEach((q, qi) => {
        const bloco = criarElemento("div", "quiz-q");
        bloco.appendChild(criarElemento("h3", "", `${qi + 1}. ${q.pergunta}`));

        const r = respostaDe(qi);
        q.opcoes.forEach((op, oi) => {
            const botao = criarElemento("button", "quiz-op", `${LETRAS[oi]}) ${op}`);
            botao.type = "button";
            botao.dataset.q = qi;
            botao.dataset.o = oi;
            if (r !== undefined) botao.disabled = true;
            if (r === oi) botao.classList.add("escolhida");
            bloco.appendChild(botao);
        });
        sec.appendChild(bloco);
    });

    if (Object.keys(respostasProva).length === total) {
        const acertos = contarAcertos();
        const placar = criarElemento("div", "placar");
        if (provaAprovada) {
            placar.appendChild(criarElemento("p", "", `Aprovado! Você acertou ${acertos} de ${total}.`));
        } else {
            placar.appendChild(criarElemento("p", "", `Você acertou ${acertos} de ${total}. Para passar, precisa de pelo menos ${PROVA.minimoAcertos}. Refaça a prova.`));
            const btn = criarElemento("button", "btn-refazer", "Refazer prova");
            btn.type = "button";
            btn.dataset.acao = "refazer";
            placar.appendChild(btn);
        }
        sec.appendChild(placar);
    }
}

function criarSecaoProva() {
    const sec = criarElemento("section", "aula-secao prova-secao");
    sec.id = idDaSecao(PROVA.id);
    sec.dataset.key = PROVA.id;

    sec.addEventListener("click", e => {
        const op = e.target.closest(".quiz-op");
        if (op && !op.disabled) {
            const qi = +op.dataset.q;
            const oi = +op.dataset.o;
            if (respostaDe(qi) !== undefined) return;

            respostasProva[qi] = oi;

            // Quando responde a última, calcula a aprovação
            if (Object.keys(respostasProva).length === PROVA.questoes.length) {
                if (contarAcertos() >= PROVA.minimoAcertos) {
                    provaAprovada = true;
                    feitas.add(PROVA.id);
                    salvarConclusoesLocais();
                    atualizarUI(PROVA.id);
                }
            }
            salvarProva();
            desenharProva(sec);
            return;
        }

        if (e.target.closest("[data-acao='refazer']")) {
            respostasProva = {};
            provaAprovada = false;
            salvarProva();
            desenharProva(sec);
        }
    });

    desenharProva(sec);
    return sec;
}

function renderTudo() {
    pagina.replaceChildren();
    curso.modulos.forEach((modulo, mi) => {
        pagina.appendChild(criarElemento("h2", "modulo-head", modulo.titulo || `Módulo ${mi + 1}`));
        modulo.aulas.forEach(aula => pagina.appendChild(criarSecaoAula(aula, modulo)));
    });
    pagina.appendChild(criarSecaoProva());
}

/* ----- Conclusão automática ----- */
const observador = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
        if (!en.isIntersecting) return;
        const key = en.target.dataset.key;
        destacarNaLateral(key);
        marcarVista(key);
    });
}, { root: null, rootMargin: "-68px 0px -55% 0px", threshold: 0 });

function verificarFimDaPagina() {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        todas.forEach(a => marcarVista(String(a.id)));
    }
}

window.addEventListener("scroll", verificarFimDaPagina, { passive: true });

btnReiniciar.addEventListener("click", () => {
    if (!confirm("Zerar todo o progresso deste curso?")) return;
    feitas = new Set();
    respostasProva = {};
    provaAprovada = false;
    salvarConclusoesLocais();
    salvarProva();
    location.hash = "";
    location.reload();
});

function mostrarErro(mensagem) {
    tituloCurso.textContent = "Erro ao carregar curso";
    pagina.textContent = mensagem;
}

async function iniciarCurso() {
    if (!cursoId) {
        pagina.textContent = "Nenhum curso foi selecionado. Volte ao catálogo e escolha um curso.";
        return;
    }

    try {
        const [dadosCurso, modulos] = await Promise.all([
            buscarJson(`${API_URL}/cursos/${encodeURIComponent(cursoId)}`),
            buscarJson(`${API_URL}/cursos/${encodeURIComponent(cursoId)}/modulos`)
        ]);

        curso = { ...dadosCurso, modulos: [] };

        if (!Array.isArray(modulos) || modulos.length === 0) {
            tituloCurso.textContent = curso.titulo || "Curso";
            pagina.textContent = "Este curso ainda não possui módulos cadastrados.";
            return;
        }

        curso.modulos = await Promise.all(
            modulos.map(async modulo => {
                const aulasLista = await buscarJson(`${API_URL}/modulos/${encodeURIComponent(modulo.id)}/aulas`);
                const lista = Array.isArray(aulasLista) ? aulasLista : [];

                const aulas = await Promise.all(
                    lista.map(async aula => {
                        const detalhes = await buscarJson(`${API_URL}/aulas/${encodeURIComponent(aula.id)}`);
                        return { ...aula, ...detalhes };
                    })
                );

                return { ...modulo, aulas };
            })
        );

        todas = [];
        curso.modulos.forEach((modulo, mi) => {
            modulo.aulas.forEach(aula => todas.push({ ...aula, mi }));
        });

        if (todas.length === 0) {
            tituloCurso.textContent = curso.titulo || "Curso";
            pagina.textContent = "Este curso ainda não possui aulas cadastradas.";
            return;
        }

        await carregarConclusoes();
        carregarProva();

        montarMenu();
        renderTudo();

        const primeiroModulo = document.querySelector(".modulo");
        if (primeiroModulo) primeiroModulo.classList.add("aberto");

        verificarFimDaPagina();

        const alvo = decodeURIComponent(aulaSelecionada || (window.location.hash.match(/aula-(.+)/) || [])[1] || "");
        if (alvo) {
            const secao = document.getElementById(`aula-${alvo}`);
            if (secao) {
                setTimeout(() => secao.scrollIntoView({ behavior: "smooth", block: "start" }), 160);
                destacarNaLateral(alvo);
            }
        }
    } catch (erro) {
        console.error("Erro ao carregar o curso:", erro);
        mostrarErro("Não foi possível carregar este curso. Verifique se a API e o MySQL estão funcionando e tente atualizar a página.");
    }
}

const aguardarAuth = new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, usuario => {
        unsubscribe();
        resolve(usuario);
    });
});

aguardarAuth.then(() => iniciarCurso());