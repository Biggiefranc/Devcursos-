import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import { requisicaoAPI } from "./services/api";
import { courseCard, escapeHtml } from "./courseCard";

const grid = document.getElementById("savedCourses");
const status = document.getElementById("savedStatus");
const userName = document.getElementById("userName");
const savedCount = document.getElementById("savedCount");
let savedCourses = [];

function render() {
  savedCount.textContent = String(savedCourses.length).padStart(2, "0");
  grid.innerHTML = savedCourses
    .map(
      (course, index) =>
        '<div class="saved-course-entry">' +
        courseCard(course, index, {
          href: "visualizarcurso.html?curso=" + encodeURIComponent(course.id),
        }) +
        '<button class="saved-remove" type="button" data-course-id="' +
        escapeHtml(course.id) +
        '" aria-label="Remover ' +
        escapeHtml(course.titulo) +
        ' dos cursos salvos">Remover</button></div>',
    )
    .join("");

  if (!savedCourses.length) {
    grid.innerHTML =
      '<div class="saved-empty"><span class="section-kicker">LISTA VAZIA</span><h3>Guarde uma formação para depois.</h3><p>Use “Salvar formação” no currículo para mantê-la nesta lista.</p><a class="button button-primary" href="catalogo.html">Explorar formações</a></div>';
    return;
  }

  grid.querySelectorAll("[data-course-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const courseId = button.dataset.courseId;
      button.disabled = true;
      try {
        await requisicaoAPI("/cursos/" + encodeURIComponent(courseId) + "/favorito", {
          method: "PUT",
          body: JSON.stringify({ favoritado: false }),
        });
        savedCourses = savedCourses.filter(
          (course) => String(course.id) !== String(courseId),
        );
        render();
      } catch (error) {
        status.textContent = error.message || "Não foi possível remover o curso.";
        button.disabled = false;
      }
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        current.unobserve(entry.target);
      });
    });
    grid.querySelectorAll("[data-reveal]").forEach((card) => observer.observe(card));
  } else {
    grid.querySelectorAll("[data-reveal]").forEach((card) => card.classList.add("is-visible"));
  }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("devcursos_token");
  localStorage.removeItem("devcursos_user");
  location.href = "index.html";
});

const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user);
  });
});

authReady
  .then(async (user) => {
    if (!user) {
      location.replace("login.html?redirect=" + encodeURIComponent("salvos.html"));
      return;
    }
    localStorage.setItem("devcursos_token", await user.getIdToken());
    const [profile, result] = await Promise.all([
      requisicaoAPI("/me"),
      requisicaoAPI("/me/favoritos"),
    ]);
    userName.textContent =
      profile?.usuario?.nome?.trim().split(/\s+/)[0] ||
      user.displayName?.trim().split(/\s+/)[0] ||
      user.email?.split("@")[0] ||
      "Minha conta";
    savedCourses = Array.isArray(result.favoritos) ? result.favoritos : [];
    render();
  })
  .catch((error) => {
    console.error("Falha ao carregar formações salvas.", error);
    grid.innerHTML =
      '<div class="inline-error"><p>Não foi possível abrir sua lista.</p><a href="menudashbord.html">Voltar ao meu espaço</a></div>';
    status.textContent = error.message || "Tente novamente em instantes.";
  });
