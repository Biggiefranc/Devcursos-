import { signOut } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import { requisicaoAPI } from "./services/api";
import { courseCard } from "./courseCard";

const nameNode = document.getElementById("userName");
const welcome = document.getElementById("welcomeTitle");
const courseGrid = document.getElementById("dashboardCourses");
const courseStatus = document.getElementById("dashboardStatus");
const continueSection = document.getElementById("continueSection");
const continueGrid = document.getElementById("continueGrid");

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
    .map(({ course, summary }) => {
      const total = summary.totalAulas;
      const done = summary.aulasConcluidas;
      const percent = total ? Math.round((done / total) * 100) : 0;
      const next = summary.proximaAula;
      const assessment = summary.proximaAvaliacao;
      const action = assessment ? assessment.titulo : "Continuar " + next.titulo;
      const target = assessment ? "avaliacao-" + assessment.id : next.id;
      return (
        '<article class="continue-card"><h3>' +
        escape(course.titulo) +
        "</h3><p>" +
        escape(action) +
        '</p><div class="course-meta"><span>' +
        percent +
        "% concluído</span><span>" +
        done +
        " de " +
        total +
        " aulas</span></div>" +
        '<a class="course-card-link" href="' +
        courseLink(course.id, target) +
        '" aria-label="' +
        escape(action) +
        '"></a></article>'
      );
    })
    .join("");
}

async function loadDashboard(user) {
  try {
    const [profile, coursesData, progressData] = await Promise.all([
      requisicaoAPI("/me"),
      requisicaoAPI("/cursos", { autenticada: false }),
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
      "Olá, <span>" + escape(firstName) + "</span>.";
    const courses = Array.isArray(coursesData) ? coursesData : [];
    courseGrid.innerHTML = courses
      .map(courseCard)
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
        return summary?.aulasConcluidas > 0 && (summary.proximaAvaliacao || summary.proximaAula)
          ? { course, summary }
          : null;
      })
      .filter(Boolean);
    renderContinue(studyRecords);
  } catch (error) {
    console.error("Falha ao carregar o espaço do estudante.", error);
    courseGrid.innerHTML =
      '<div class="inline-error"><p>Não conseguimos abrir seu espaço agora.</p><a href="catalogo.html">Ver formações disponíveis</a></div>';
    courseStatus.textContent =
      error.message || "Verifique sua conexão e tente atualizar a página.";
  }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  location.href = "index.html";
});

auth.authStateReady()
  .then(() => {
    const user = auth.currentUser;
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
