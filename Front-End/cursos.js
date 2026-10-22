
const API_BASE = "http://localhost:3000";

const tituloCurso = document.getElementById("tituloCurso");
const menu = document.getElementById("menu");
const pagina = document.getElementById("pagina");
const btnAnterior = document.getElementById("btnAnterior");
const btnConcluir = document.getElementById("btnConcluir");
const btnProxima = document.getElementById("btnProxima");

let curso = null;
let todas = [];
let atual = 0;
let feitas = new Set();

const parametros = new URLSearchParams(window.location.search);
const cursoId = parametros.get("curso");

async function buscarJson(url) {
    const resposta = await fetch(url);
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        throw new Error(
            dados?.mensagem || `Erro na requisição: ${resposta.status}`
        );
    }

    return dados;
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
}

function chave(i) {
    return String(todas[i].id);
}

function carregarConclusoes() {
    try {
        feitas = new Set(
            JSON.parse(localStorage.getItem("devcursos-feitas") || "[]")
                .map(String)
        );
    } catch {
        feitas = new Set();
    }
}

function salvarConclusoes() {
    try {
        localStorage.setItem(
            "devcursos-feitas",
            JSON.stringify([...feitas])
        );
    } catch (erro) {
        console.error("Não foi possível salvar as conclusões:", erro);
    }
}

// Converte Markdown básico em HTML, escapando HTML fornecido pelo conteúdo.
function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function renderizarMarkdown(markdown) {
    const html = marked.parse(String(markdown ?? ""));
    return DOMPurify.sanitize(html);
}

function obterConteudo(aula) {
    return String(aula.conteudo ?? "");
}


function montarMenu() {
    tituloCurso.textContent = curso.titulo || "Curso";
    menu.replaceChildren();

    let indice = 0;

    curso.modulos.forEach((modulo, mi) => {
        const box = criarElemento(
            "div",
            "modulo" + (mi === todas[atual]?.mi ? " aberto" : "")
        );

        const botaoModulo = criarElemento("button", "modulo-btn");
        botaoModulo.type = "button";

        const nomeModulo = criarElemento(
            "span",
            "",
            modulo.titulo || `Módulo ${mi + 1}`
        );

        const seta = criarElemento("span", "seta", "▶");
        botaoModulo.append(nomeModulo, seta);

        botaoModulo.addEventListener("click", () => {
            box.classList.toggle("aberto");
        });

        const listaAulas = criarElemento("div", "aulas");

        modulo.aulas.forEach(aula => {
            const i = indice++;
            const concluida = feitas.has(chave(i));

            const botaoAula = criarElemento(
                "button",
                "aula-btn" +
                    (i === atual ? " ativa" : "") +
                    (concluida ? " concluida" : "")
            );

            botaoAula.type = "button";

            const check = criarElemento(
                "span",
                "check",
                concluida ? "✓" : ""
            );

            const nomeAula = criarElemento(
                "span",
                "",
                aula.titulo || `Aula ${i + 1}`
            );

            botaoAula.append(check, nomeAula);
            botaoAula.addEventListener("click", () => abrir(i));

            listaAulas.appendChild(botaoAula);
        });

        box.append(botaoModulo, listaAulas);
        menu.appendChild(box);
    });
}

function abrir(i) {
    if (i < 0 || i >= todas.length) return;

    atual = i;

    const aula = todas[atual];
    const modulo = curso.modulos[aula.mi];

    pagina.replaceChildren();

    pagina.appendChild(
        criarElemento(
            "p",
            "trilha",
            modulo.titulo || `Módulo ${aula.mi + 1}`
        )
    );

    pagina.appendChild(
        criarElemento("h1", "", aula.titulo || `Aula ${i + 1}`)
    );

    const corpo = criarElemento("div", "corpo-aula");
    corpo.innerHTML = renderizarMarkdown(obterConteudo(aula));

    if (!obterConteudo(aula).trim()) {
        corpo.appendChild(
            criarElemento(
                "p",
                "",
                "Esta aula ainda não possui conteúdo cadastrado."
            )
        );
    }

    pagina.appendChild(corpo);

    btnAnterior.disabled = i === 0;
    btnProxima.disabled = i === todas.length - 1;

    btnConcluir.textContent = feitas.has(chave(i))
        ? "Desmarcar conclusão"
        : "Marcar como concluída";

    history.replaceState(null, "", "#aula-" + encodeURIComponent(aula.id));

    montarMenu();
    window.scrollTo(0, 0);
}

btnAnterior.addEventListener("click", () => abrir(atual - 1));
btnProxima.addEventListener("click", () => abrir(atual + 1));

btnConcluir.addEventListener("click", () => {
    const id = chave(atual);

    if (feitas.has(id)) {
        feitas.delete(id);
    } else {
        feitas.add(id);
    }

    salvarConclusoes();
    abrir(atual);
});

async function iniciarCurso() {
    if (!cursoId) {
        pagina.textContent =
            "Nenhum curso foi selecionado. Volte ao catálogo e escolha um curso.";
        btnAnterior.disabled = true;
        btnProxima.disabled = true;
        btnConcluir.disabled = true;
        return;
    }

    carregarConclusoes();

    try {
        const [dadosCurso, modulos] = await Promise.all([
            buscarJson(`${API_BASE}/cursos/${encodeURIComponent(cursoId)}`),
            buscarJson(`${API_BASE}/cursos/${encodeURIComponent(cursoId)}/modulos`)
        ]);

        curso = {
            ...dadosCurso,
            modulos: []
        };

        if (!Array.isArray(modulos) || modulos.length === 0) {
            pagina.textContent = "Este curso ainda não possui módulos cadastrados.";
            tituloCurso.textContent = curso.titulo || "Curso";
            return;
        }

        
curso.modulos = await Promise.all(
    modulos.map(async modulo => {
        const aulasLista = await buscarJson(
            `${API_BASE}/modulos/${encodeURIComponent(modulo.id)}/aulas`
        );

        const lista = Array.isArray(aulasLista) ? aulasLista : [];

        const aulasComConteudo = await Promise.all(
            lista.map(async aula => {
                const detalhes = await buscarJson(
                    `${API_BASE}/aulas/${encodeURIComponent(aula.id)}`
                );

                return {
                    ...aula,
                    ...detalhes
                };
            })
        );

        return {
            ...modulo,
            aulas: aulasComConteudo
        };
    })
);


        todas = [];

        curso.modulos.forEach((modulo, mi) => {
            modulo.aulas.forEach(aula => {
                todas.push({
                    ...aula,
                    mi
                });
            });
        });

        if (todas.length === 0) {
            tituloCurso.textContent = curso.titulo || "Curso";
            pagina.textContent = "Este curso ainda não possui aulas cadastradas.";
            btnAnterior.disabled = true;
            btnProxima.disabled = true;
            btnConcluir.disabled = true;
            return;
        }

        const hash = decodeURIComponent(
            (window.location.hash.match(/aula-(.+)/) || [])[1] || ""
        );

        const indiceInicial = todas.findIndex(
            aula => String(aula.id) === hash
        );

        abrir(indiceInicial >= 0 ? indiceInicial : 0);
    } catch (erro) {
        console.error("Erro ao carregar o curso:", erro);

        tituloCurso.textContent = "Erro ao carregar curso";
        pagina.textContent =
            "Não foi possível carregar este curso. Verifique se a API e o MySQL estão funcionando e tente atualizar a página.";

        btnAnterior.disabled = true;
        btnProxima.disabled = true;
        btnConcluir.disabled = true;
    }
}

iniciarCurso();
