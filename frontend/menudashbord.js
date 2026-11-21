import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import { requisicaoAPI } from "./services/api";
import { courseCard } from "./courseCard";

const nameNode = document.getElementById("userName");
const welcome = document.getElementById("welcomeTitle");
const courseGrid = document.getElementById("dashboardCourses");
const courseStatus = document.getElementById("dashboardStatus");
const continueSection = document.getElementById("continueSection");
const continueGrid = document.getElementById("continueGrid");

const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user);
  });
});

function escape(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function courseLink(courseId, lessonId) {
  return (
    "cursos.html?curso=" +
    encodeURIComponent(courseId) +
    (lessonId ? "&aula=" + encodeURIComponent(lessonId) : "")
  );
}

function renderContinue(items) {
  if (!items.length) return;
  continueSection.hidden = false;
  continueGrid.innerHTML = items
    .map(({ course, summary }, index) => {
      const total = summary.totalAulas;
      const done = summary.aulasConcluidas;
      const percent = total ? Math.round((done / total) * 100) : 0;
      const next = summary.proximaAula;
      const nextTitle = next ? next.titulo : "Abrir currículo";
      return (
        '<article class="continue-card" data-reveal><span class="course-index">EM ANDAMENTO / ' +
        String(index + 1).padStart(2, "0") +
        "</span><h3>" +
        escape(course.titulo) +
        "</h3><p>Próxima aula: " +
        escape(nextTitle) +
        '</p><div class="course-meta"><span>' +
        percent +
        "% concluído</span><span>" +
        done +
        " DE " +
        total +
        " AULAS</span></div>" +
        '<a class="course-card-link" href="' +
        courseLink(course.id, next?.id) +
        '" aria-label="Continuar ' +
        escape(course.titulo) +
        '"></a></article>'
      );
    })
    .join("");
  continueGrid
    .querySelectorAll("[data-reveal]")
    .forEach((node) =>
      requestAnimationFrame(() => node.classList.add("is-visible")),
    );
}

async function loadDashboard(user) {
  try {
    localStorage.setItem("devcursos_token", await user.getIdToken());
    const [profile, coursesData, progressData] = await Promise.all([
      requisicaoAPI("/me"),
      requisicaoAPI("/cursos"),
      requisicaoAPI("/me/progresso").catch((error) => {
        console.warn("Não foi possível carregar o resumo de progresso.", error);
        return { cursos: [] };
      }),
    ]);
    const profileName =
      profile?.usuario?.nome ||
      user.displayName ||
      user.email?.split("@")[0] ||
      "Estudante";
    const firstName = profileName.trim().split(/\s+/)[0];
    nameNode.textContent = firstName;
    welcome.innerHTML =
      "Olá, <span>" + escape(firstName) + "</span>. Vamos avançar?";
    localStorage.setItem(
      "devcursos_user",
      JSON.stringify(
        profile.usuario || { nome: profileName, email: user.email },
      ),
    );

    const courses = Array.isArray(coursesData) ? coursesData : [];
    courseGrid.innerHTML = courses
      .map((course, index) => courseCard(course, index))
      .join("");
    if (!courses.length) {
      courseGrid.innerHTML =
        '<div class="inline-error"><p>Não há formações publicadas por enquanto.</p><a href="catalogo.html">Abrir catálogo</a></div>';
      return;
    }

    const summaries = new Map(
      (progressData.cursos || []).map((summary) => [
        String(summary.cursoId),
        summary,
      ]),
    );
    const studyRecords = courses
      .map((course) => {
        const summary = summaries.get(String(course.id));
        return summary?.aulasConcluidas > 0 && summary.proximaAula
          ? { course, summary }
          : null;
      })
      .filter(Boolean);
    renderContinue(studyRecords);
    courseGrid
      .querySelectorAll("[data-reveal]")
      .forEach((node) =>
        requestAnimationFrame(() => node.classList.add("is-visible")),
      );
  } catch (error) {
    console.error("Falha ao carregar o espaço do estudante.", error);
    courseGrid.innerHTML =
      '<div class="inline-error"><p>Não conseguimos abrir seu espaço agora.</p><a href="catalogo.html">Ver formações disponíveis</a></div>';
    courseStatus.textContent =
      error.message || "Verifique sua conexão e tente atualizar a página.";
  }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  localStorage.removeItem("devcursos_token");
  localStorage.removeItem("devcursos_user");
  await signOut(auth);
  location.href = "index.html";
});

authReady
  .then((user) => {
    if (!user) {
      const target = encodeURIComponent(location.pathname + location.search);
      location.replace("login.html?redirect=" + target);
      return;
    }
    loadDashboard(user);
  })
  .catch((error) => {
    console.error("Falha na autenticação.", error);
    location.replace("login.html");
  });
