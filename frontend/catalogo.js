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
let query = "";

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

queryInput.form?.addEventListener("submit", (event) => event.preventDefault());

function attachReveal() {
  if (!("IntersectionObserver" in window)) {
    grid
      .querySelectorAll("[data-reveal]")
      .forEach((node) => node.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, current) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          current.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  grid
    .querySelectorAll("[data-reveal]")
    .forEach((node) => observer.observe(node));
}

function render() {
  const term = normalize(query);
  const filtered = courses.filter((course) => {
    const matchesCategory =
      category === "Todas" ||
      normalize(course.categoria) === normalize(category);
    const matchesQuery =
      !term ||
      normalize(
        [course.titulo, course.descricao, course.categoria, course.nivel].join(
          " ",
        ),
      ).includes(term);
    return matchesCategory && matchesQuery;
  });
  title.textContent = query
    ? "Resultados para “" + query + "”"
    : category === "Todas"
      ? "Todas as formações"
      : category;
  count.textContent = String(filtered.length).padStart(2, "0") + " FORMAÇÕES";
  grid.hidden = !filtered.length;
  emptyState.hidden = filtered.length > 0;
  grid.innerHTML = filtered
    .map((course, index) => courseCard(course, index))
    .join("");
  filters
    .querySelectorAll(".filter-button")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.category === category),
      ),
    );
  attachReveal();
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  category = button.dataset.category;
  render();
});
queryInput.addEventListener("input", () => {
  query = queryInput.value.trim();
  render();
});
document.getElementById("clearCatalog").addEventListener("click", () => {
  if (!courses.length && count.textContent === "TENTE NOVAMENTE") {
    loadCatalog();
    return;
  }
  query = "";
  category = "Todas";
  queryInput.value = "";
  render();
});

async function loadCatalog() {
  query = new URLSearchParams(location.search).get("busca") || "";
  queryInput.value = query;
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
    render();
    status.textContent = courses.length
      ? ""
      : "Nenhuma formação publicada no momento.";
  } catch (error) {
    console.error("Falha ao carregar o catálogo.", error);
    grid.hidden = true;
    emptyState.hidden = false;
    emptyState.querySelector(".section-kicker").textContent =
      "CATÁLOGO INDISPONÍVEL";
    emptyState.querySelector("h3").textContent =
      "Não conseguimos consultar as formações.";
    document.getElementById("clearCatalog").textContent = "Tentar novamente";
    status.textContent = "Verifique sua conexão com a API e atualize a página.";
    count.textContent = "TENTE NOVAMENTE";
  }
}

loadCatalog();
