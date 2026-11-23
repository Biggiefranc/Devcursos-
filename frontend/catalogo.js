import { API_URL } from "./services/config";
import { courseCard, escapeHtml } from "./courseCard";

const grid = document.getElementById("catalogGrid");
const filters = document.getElementById("catalogFilters");
const title = document.getElementById("catalogTitle");
const count = document.getElementById("courseCount");
const queryInput = document.getElementById("catalogQuery");
const emptyState = document.getElementById("catalogEmpty");
const status = document.getElementById("catalogStatus");
let courses = [];
let category = "Todas";
let query = new URLSearchParams(location.search).get("busca") || "";
queryInput.value = query;
let loadFailed = false;
const emptyTitle = emptyState.querySelector("h3");
const clearButton = document.getElementById("clearCatalog");

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

queryInput.form?.addEventListener("submit", (event) => event.preventDefault());

function render() {
  const term = normalize(query);
  const filtered = courses.filter((course) => {
    const matchesCategory =
      category === "Todas" ||
      normalize(course.categoria) === normalize(category);
    const matchesQuery =
      !term ||
      normalize(
        [course.titulo, course.descricao, course.categoria, course.nivel, course.tecnologias].join(
          " ",
        ),
      ).includes(term);
    return matchesCategory && matchesQuery;
  });
  title.textContent = query
    ? "Resultados para “" + query + "”"
    : category === "Todas"
      ? "Todos os cursos"
      : category;
  count.textContent = filtered.length + (filtered.length === 1 ? " curso" : " cursos");
  grid.hidden = !filtered.length;
  emptyState.hidden = filtered.length > 0;
  grid.innerHTML = filtered.map(courseCard).join("");
  filters
    .querySelectorAll(".filter-button")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.category === category),
      ),
    );
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  category = button.dataset.category;
  render();
});
queryInput.addEventListener("input", () => {
  query = queryInput.value.trim();
  if (!loadFailed) render();
});
clearButton.addEventListener("click", () => {
  if (loadFailed) {
    loadCatalog();
    return;
  }
  query = "";
  category = "Todas";
  queryInput.value = "";
  render();
});

async function loadCatalog() {
  try {
    const response = await fetch(API_URL + "/cursos", {
      headers: { Accept: "application/json" },
      signal:
        typeof AbortSignal !== "undefined" && AbortSignal.timeout
          ? AbortSignal.timeout(9000)
          : undefined,
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    courses = (Array.isArray(data) ? data : []).sort((a, b) =>
      String(a.titulo).localeCompare(String(b.titulo), "pt-BR"),
    );
    const categories = [
      "Todas",
      ...new Set(courses.map((course) => course.categoria).filter(Boolean)),
    ];
    filters.innerHTML = categories
      .map(
        (item) =>
          '<button class="filter-button" type="button" data-category="' +
          escapeHtml(item) +
          '" aria-pressed="' +
          String(item === category) +
          '">' +
          escapeHtml(item) +
          "</button>",
      )
      .join("");
    loadFailed = false;
    clearButton.textContent = "Limpar busca";
    emptyTitle.textContent = "Nenhum curso encontrado.";
    render();
    status.textContent = courses.length
      ? ""
      : "Nenhuma formação publicada no momento.";
  } catch (error) {
    console.error("Falha ao carregar o catálogo.", error);
    grid.hidden = true;
    emptyState.hidden = false;
    loadFailed = true;
    emptyTitle.textContent = "Não foi possível carregar os cursos.";
    clearButton.textContent = "Tentar novamente";
    status.textContent = "";
    count.textContent = "";
  }
}

loadCatalog();
