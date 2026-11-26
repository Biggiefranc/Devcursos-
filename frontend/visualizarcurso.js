import { auth } from "./firebase/firebase-config";
import { requisicaoAPI, encerrarSessao } from "./services/api";
import { escapeHtml } from "./courseCard";

const params = new URLSearchParams(location.search);
const courseId = params.get("curso");
const root = document.getElementById("courseDetail");
const breadcrumb = document.getElementById("breadcrumbCourse");
const accountLink = document.getElementById("accountLink");
let favorites = new Set();

const esc = escapeHtml;
const isLogged = () => Boolean(auth.currentUser);

function nameFor(userData) {
  const raw = String(userData?.nome || userData?.email || "").trim();
  return (
    (raw.includes("@") ? raw.split("@")[0] : raw)
      .split(/[ ._-]+/)
      .filter(Boolean)[0] || "Minha conta"
  );
}

async function loadAccount() {
  if (!isLogged()) {
    accountLink.href =
      "login.html?redirect=" +
      encodeURIComponent(location.pathname + location.search);
    return;
  }
  try {
    const [profileData, favoriteData] = await Promise.all([
      requisicaoAPI("/me"),
      requisicaoAPI("/me/favoritos"),
    ]);
    const user = profileData.usuario;
    if (user) {
      accountLink.textContent = nameFor(user);
      accountLink.href = "menudashbord.html";
    }
    favorites = new Set(
      (favoriteData.favoritos || []).map((item) => String(item.id)),
    );
  } catch (error) {
    if (error.status === 401 || error.status === 404) {
      await encerrarSessao();
      favorites.clear();
      accountLink.textContent = "Entrar";
      accountLink.href =
        "login.html?redirect=" +
        encodeURIComponent(location.pathname + location.search);
    } else console.warn("Não foi possível carregar os dados da conta.", error);
  }
}

function categorySlug(category) {
  const value = String(category || "").toLowerCase();
  if (value.includes("front")) return "frontend";
  if (value.includes("devops")) return "devops";
  return "programacao";
}

function metadata(course) {
  const hours = Number(course.duracao_horas);
  const duration = Number.isFinite(hours) && hours > 0
    ? hours < 1
      ? Math.max(1, Math.round(hours * 60)) + " min"
      : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(hours) + " h"
    : "";
  const technology = Array.isArray(course.tecnologias) ? course.tecnologias.join(", ") : "";
  const items = [duration, technology].filter(Boolean);
  return items.length
    ? '<div class="detail-meta">' + items.map((item) => "<span>" + esc(item) + "</span>").join("") + "</div>"
    : "";
}

function render(course, modules) {
  breadcrumb.textContent = course.titulo || "Formação";
  document.title = (course.titulo || "Formação") + " | DevCursos+";
  const lessonsTotal = modules.reduce(
    (sum, module) => sum + (module.aulas || []).length,
    0,
  );
  const favorite = favorites.has(String(course.id));
  const startTarget = "cursos.html?curso=" + encodeURIComponent(course.id);
  const startHref = isLogged()
    ? startTarget
    : "login.html?redirect=" + encodeURIComponent(startTarget);

  const moduleMarkup = modules.length
    ? modules
        .map((module, index) => {
          const lessons = module.aulas || [];
          return (
            '<details class="detail-module"' +
            (index === 0 ? " open" : "") +
            ">" +
            '<summary class="detail-module-toggle"><span class="detail-module-index">' +
            String(index + 1).padStart(2, "0") +
            '</span><span class="detail-module-name">' +
            esc(module.titulo || "Módulo " + (index + 1)) +
            '</span><span class="detail-module-count">' +
            lessons.length +
            (lessons.length === 1 ? " aula" : " aulas") +
            "</span></summary>" +
            '<div class="detail-lesson-list">' +
            (lessons.length
              ? lessons
                  .map((lesson, lessonIndex) => {
                    const target =
                      startTarget + "&aula=" + encodeURIComponent(lesson.id);
                    const href = isLogged()
                      ? target
                      : "login.html?redirect=" + encodeURIComponent(target);
                    return (
                      '<a class="detail-lesson" href="' +
                      href +
                      '"><span>' +
                      String(index + 1).padStart(2, "0") +
                      "." +
                      String(lessonIndex + 1).padStart(2, "0") +
                      "  " +
                      esc(lesson.titulo || "Aula") +
                      '</span><span class="lesson-meta">' +
                      (Number(lesson.duracao_minutos) > 0
                        ? Number(lesson.duracao_minutos) + " min · "
                        : "") +
                      "Abrir aula</span></a>"
                    );
                  })
                  .join("")
              : '<p class="aside-note">Este módulo ainda não tem aulas publicadas.</p>') +
            "</div></details>"
          );
        })
        .join("")
    : '<p class="inline-error">O currículo desta formação ainda não foi publicado.</p>';

  root.innerHTML =
    '<div class="course-detail-layout">' +
    '<section class="course-detail-main">' +
    '<div class="detail-topline"><span>' +
    esc(course.categoria || "Formação") +
    '</span><button type="button" class="favorite" id="favoriteBtn" aria-pressed="' +
    favorite +
    '">' +
    (favorite ? "Salvo na sua lista" : "Salvar formação") +
    "</button></div>" +
    "<h1>" +
    esc(course.titulo || "Formação") +
    "</h1>" +
    '<p class="course-detail-description">' +
    esc(
      course.descricao ||
        "Consulte os módulos e encontre o ponto de partida para esta formação.",
    ) +
    "</p>" +
    metadata(course) +
    '<div class="detail-actions"><a class="button button-primary" href="' +
    startHref +
    '">' +
    (isLogged() ? "Começar a estudar" : "Entrar para estudar") +
    '</a><a class="button button-outline" href="catalogo.html">Voltar ao catálogo</a></div>' +
    (course.projeto_final
      ? '<div class="detail-project"><h2>Projeto final</h2><p>' + esc(course.projeto_final) + "</p></div>"
      : "") +
    '<div class="curriculum-heading"><h2>O que você vai estudar</h2><span>' +
    lessonsTotal +
    (lessonsTotal === 1 ? " aula em " : " aulas em ") +
    modules.length +
    (modules.length === 1 ? ' módulo' : ' módulos') + '</span></div><div class="detail-modules">' +
    moduleMarkup +
    "</div></section>" +
    '<aside class="detail-aside"><h2>Sobre esta formação</h2>' +
    '<div class="aside-row"><span>Área</span><b>' +
    esc(course.categoria || "Não informada") +
    "</b></div>" +
    '<div class="aside-row"><span>Nível</span><b>' +
    esc(course.nivel || "Não informado") +
    "</b></div>" +
    '<div class="aside-row"><span>Currículo</span><b>' +
    modules.length +
    (modules.length === 1 ? " módulo" : " módulos") + "</b></div>" +
    '<div class="aside-row"><span>Aulas</span><b>' +
    lessonsTotal +
    (lessonsTotal === 1 ? " aula" : " aulas") + "</b></div></aside></div>";

  document
    .getElementById("favoriteBtn")
    .addEventListener("click", async (event) => {
      if (!isLogged()) {
        location.href =
          "login.html?redirect=" +
          encodeURIComponent(location.pathname + location.search);
        return;
      }
      const button = event.currentTarget;
      button.disabled = true;
      const next = !favorites.has(String(course.id));
      try {
        await requisicaoAPI(
          "/cursos/" + encodeURIComponent(course.id) + "/favorito",
          {
            method: "PUT",
            body: JSON.stringify({ favoritado: next }),
          },
        );
        if (next) favorites.add(String(course.id));
        else favorites.delete(String(course.id));
        button.setAttribute("aria-pressed", String(next));
        button.textContent = next ? "Salvo na sua lista" : "Salvar formação";
      } catch (error) {
        button.textContent = error.message || "Não foi possível salvar";
        window.setTimeout(() => {
          button.textContent = favorites.has(String(course.id))
            ? "Salvo na sua lista"
            : "Salvar formação";
        }, 2200);
      } finally {
        button.disabled = false;
      }
    });

  accountLink.addEventListener(
    "click",
    async (event) => {
      if (!isLogged() || accountLink.href.includes("login.html")) return;
      event.preventDefault();
      if (!confirm("Deseja sair da sua conta?")) return;
      await encerrarSessao();
      location.href = "index.html";
    },
    { once: true },
  );
}

async function loadCourse() {
  await auth.authStateReady();
  if (!courseId) {
    root.innerHTML =
      '<div class="inline-error"><p>Escolha uma formação para consultar o currículo.</p><a class="button button-primary" href="catalogo.html">Abrir catálogo</a></div>';
    return;
  }

  try {
    const accountPromise = loadAccount();
    const curriculumPromise = requisicaoAPI(
      "/cursos/" + encodeURIComponent(courseId) + "/estrutura",
      { autenticada: false },
    );
    const [accountResult, curriculum] = await Promise.all([
      accountPromise,
      curriculumPromise,
    ]);
    void accountResult;

    render(
      curriculum,
      Array.isArray(curriculum.modulos) ? curriculum.modulos : [],
    );
  } catch (error) {
    console.error("Não foi possível carregar a formação.", error);
    root.innerHTML =
      '<div class="inline-error"><p>' +
      esc(error.message || "Não foi possível carregar esta formação.") +
      '</p><a class="button button-outline" href="catalogo.html">Voltar ao catálogo</a></div>';
  }
}

loadCourse();
