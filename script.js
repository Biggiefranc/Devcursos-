/* =========================
   ELEMENTOS
========================= */

const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const filters = document.querySelectorAll(".filter");
const courses = document.querySelectorAll(".course-card");

const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");

const modal = document.getElementById("courseModal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");

const detailsButtons = document.querySelectorAll(".details-button");
const favoriteButtons = document.querySelectorAll(".favorite");

const continueButton = document.getElementById("continueButton");


/* =========================
   MENU MOBILE
========================= */

function openMenu() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
}

function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
}

menuButton.addEventListener("click", openMenu);

overlay.addEventListener("click", closeMenu);


/* =========================
   LINKS DO MENU
========================= */

const navigationLinks = document.querySelectorAll(".nav-link");

navigationLinks.forEach(link => {

    link.addEventListener("click", () => {

        navigationLinks.forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");

        closeMenu();
    });

});


/* =========================
   FILTROS
========================= */

let selectedCategory = "todos";

filters.forEach(filter => {

    filter.addEventListener("click", () => {

        filters.forEach(item => {
            item.classList.remove("active");
        });

        filter.classList.add("active");

        selectedCategory = filter.dataset.category;

        filterCourses();

    });

});


/* =========================
   BUSCA
========================= */

searchInput.addEventListener("input", () => {

    filterCourses();

});


function filterCourses() {

    const searchTerm = searchInput.value
        .toLowerCase()
        .trim();

    let visibleCourses = 0;

    courses.forEach(course => {

        const category = course.dataset.category;

        const title = course
            .querySelector("h3")
            .textContent
            .toLowerCase();

        const categoryText = course
            .querySelector(".category")
            .textContent
            .toLowerCase();

        const matchesCategory =
            selectedCategory === "todos" ||
            category === selectedCategory;

        const matchesSearch =
            title.includes(searchTerm) ||
            categoryText.includes(searchTerm);

        if (matchesCategory && matchesSearch) {

            course.style.display = "";

            visibleCourses++;

        } else {

            course.style.display = "none";

        }

    });

    if (visibleCourses === 0) {
        noResults.style.display = "block";
    } else {
        noResults.style.display = "none";
    }

}


/* =========================
   FAVORITOS
========================= */

favoriteButtons.forEach(button => {

    button.addEventListener("click", event => {

        event.preventDefault();
        event.stopPropagation();

        button.classList.toggle("active");

        const icon = button.querySelector("svg");

        if (button.classList.contains("active")) {

            icon.setAttribute("fill", "currentColor");

        } else {

            icon.setAttribute("fill", "none");

        }

    });

});


/* =========================
   MODAL DE CURSO
========================= */

detailsButtons.forEach(button => {

    button.addEventListener("click", () => {

        const courseName = button.dataset.course;

        modalTitle.textContent = courseName;

        modal.classList.add("show");

        document.body.style.overflow = "hidden";

    });

});


function closeModal() {

    modal.classList.remove("show");

    document.body.style.overflow = "";

}


modalClose.addEventListener("click", closeModal);


modal.addEventListener("click", event => {

    if (event.target === modal) {
        closeModal();
    }

});


/* ESC FECHA MODAL */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeModal();
        closeMenu();
    }

});


/* =========================
   CONTINUAR CURSO
========================= */

continueButton.addEventListener("click", () => {

    document
        .getElementById("cursos")
        .scrollIntoView({
            behavior: "smooth"
        });

});


/* =========================
   BOTÕES DE CONTINUAR
========================= */

const smallButton = document.querySelector(".small-button");

smallButton.addEventListener("click", () => {

    alert(
        "Abrindo a aula 24: Flexbox e Grid CSS..."
    );

});


/* =========================
   BOTÃO COMEÇAR CURSO
========================= */

const modalButton = document.querySelector(".modal-button");

modalButton.addEventListener("click", () => {

    alert(
        "Curso iniciado! Boa jornada de aprendizado 🚀"
    );

    closeModal();

});


/* =========================
   CENTRAL DE AJUDA
========================= */

const helpButton = document.querySelector(".help-box button");

helpButton.addEventListener("click", () => {

    alert(
        "Olá! Nossa equipe de suporte está disponível para ajudar você."
    );

});


/* =========================
   INICIALIZAÇÃO
========================= */

filterCourses();