
const API_BASE = "http://localhost:3000";

const containerCursos = document.getElementById("cursosContainer");

// Cria elementos HTML sem interpretar os dados da API como HTML.
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}

// Consulta a API e verifica se a resposta foi bem-sucedida.
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

// Exibe mensagens de carregamento e de erro.
function mostrarEstado(mensagem, tipo = "info") {
    containerCursos.replaceChildren();

    const aviso = criarElemento(
        "p",
        `estado estado-${tipo}`,
        mensagem
    );

    aviso.setAttribute(
        "role",
        tipo === "erro" ? "alert" : "status"
    );

    containerCursos.appendChild(aviso);
}

// Monta um card com os dados reais de um curso.
async function criarCardCurso(curso) {
    const card = criarElemento("a", "card");

    card.href = `cursos.html?curso=${encodeURIComponent(curso.id)}`;

    const icone = criarElemento(
        "div",
        "icone",
        (curso.titulo || "DC").slice(0, 2).toUpperCase()
    );

    icone.setAttribute("aria-hidden", "true");

    const conteudo = criarElemento("div");

    conteudo.appendChild(
        criarElemento("h2", "", curso.titulo || "Curso sem título")
    );

    conteudo.appendChild(
        criarElemento(
            "p",
            "desc",
            curso.descricao || "Descrição ainda não disponível."
        )
    );

    const info = criarElemento("div", "info");

    info.appendChild(
        criarElemento("span", "", `Categoria: ${curso.categoria || "Geral"}`)
    );

    info.appendChild(
        criarElemento("span", "", `Nível: ${curso.nivel || "Não informado"}`)
    );

    conteudo.appendChild(info);

    conteudo.appendChild(
        criarElemento("p", "modulos-titulo", "O que você vai ver no curso")
    );

    const listaModulos = criarElemento("ol", "modulos");

    listaModulos.appendChild(
        criarElemento("li", "", "Carregando módulos...")
    );

    conteudo.appendChild(listaModulos);

    const botao = criarElemento("span", "botao", "Acessar curso");
    conteudo.appendChild(botao);

    card.append(icone, conteudo);

    // Busca os módulos pertencentes a este curso.
    try {
        const modulos = await buscarJson(
            `${API_BASE}/cursos/${encodeURIComponent(curso.id)}/modulos`
        );

        listaModulos.replaceChildren();

        if (!Array.isArray(modulos) || modulos.length === 0) {
            listaModulos.appendChild(
                criarElemento("li", "", "Nenhum módulo cadastrado.")
            );
        } else {
            modulos.slice(0, 5).forEach((modulo) => {
                listaModulos.appendChild(
                    criarElemento("li", "", modulo.titulo)
                );
            });

            if (modulos.length > 5) {
                listaModulos.appendChild(
                    criarElemento(
                        "li",
                        "",
                        `E mais ${modulos.length - 5} módulo(s)...`
                    )
                );
            }
        }

        info.insertBefore(
            criarElemento("span", "", `${modulos.length} módulo(s)`),
            info.firstChild
        );
    } catch (erro) {
        console.error(
            `Erro ao carregar módulos do curso ${curso.id}:`,
            erro
        );

        listaModulos.replaceChildren(
            criarElemento(
                "li",
                "",
                "Não foi possível carregar os módulos."
            )
        );
    }

    return card;
}

// Carrega todos os cursos cadastrados no banco.
async function carregarCatalogo() {
    mostrarEstado("Carregando cursos...");

    try {
        const cursos = await buscarJson(`${API_BASE}/cursos`);

        if (!Array.isArray(cursos) || cursos.length === 0) {
            mostrarEstado("Nenhum curso cadastrado ainda.");
            return;
        }

        containerCursos.replaceChildren();

        for (const curso of cursos) {
            const card = await criarCardCurso(curso);
            containerCursos.appendChild(card);
        }
    } catch (erro) {
        console.error("Erro ao carregar o catálogo:", erro);

        mostrarEstado(
            "Não foi possível carregar os cursos. Confira se a API está funcionando e atualize a página.",
            "erro"
        );
    }
}

carregarCatalogo();
