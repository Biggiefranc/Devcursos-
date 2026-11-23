import { API_URL } from "./services/config";
import { courseCard } from "./courseCard";

const searchForm = document.getElementById("searchForm");
const homeCourses = document.getElementById("homeCourses");
const homeStatus = document.getElementById("homeCourseStatus");

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const term = document.getElementById("q")?.value.trim() || "";
  location.href =
    "catalogo.html" + (term ? "?busca=" + encodeURIComponent(term) : "");
});

async function loadFeaturedCourses() {
  if (!homeCourses) return;
  try {
    const response = await fetch(API_URL + "/cursos", {
      headers: { Accept: "application/json" },
      signal:
        typeof AbortSignal !== "undefined" && AbortSignal.timeout
          ? AbortSignal.timeout(9000)
          : undefined,
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const courses = await response.json();
    const featured = (Array.isArray(courses) ? courses : []).slice(0, 3);
    if (!featured.length) {
      homeCourses.innerHTML =
        '<p class="empty-message">As próximas formações serão publicadas aqui.</p>';
      return;
    }
    homeCourses.innerHTML = featured
      .map(courseCard)
      .join("");
    homeStatus.textContent = "";
  } catch (error) {
    console.warn("Não foi possível carregar as formações em destaque.", error);
    homeCourses.innerHTML =
      '<div class="inline-error"><p>Não conseguimos carregar o catálogo agora.</p><a href="catalogo.html">Abrir todas as formações</a></div>';
    homeStatus.textContent =
      "Confira sua conexão ou tente novamente mais tarde.";
  }
}

loadFeaturedCourses();
