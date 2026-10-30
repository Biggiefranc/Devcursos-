(() => {
  const API = "http://localhost:3000";
  const container = document.getElementById("courses");
  const search = document.getElementById("courseSearch");
  const filters = document.getElementById("filters");
  const greeting = document.getElementById("greeting");
  const accountLink = document.getElementById("accountLink");
  let courses = [];
  let selectedCategory = "Todos";

  const art = `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M14 25 40 12l26 13-26 13-26-13Z"/><path d="M23 31v18c10 9 24 9 34 0V31M66 26v20"/><circle cx="66" cy="50" r="4"/><path d="M29 54v8h22v-8"/></svg>`;
  const icons = {
    python: `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M39 12c-13 0-13 6-13 13v8h18v5H20c-7 0-10 5-10 13s4 13 12 13h9v-9c0-7 5-12 12-12h12c6 0 10-5 10-12V25c0-8-7-13-16-13H39Z"/><circle cx="35" cy="22" r="2" fill="currentColor"/><path d="M42 68c13 0 13-6 13-13v-8H37v-5h24c7 0 10-5 10-13s-4-13-12-13h-9v9c0 7-5 12-12 12H26c-6 0-10 5-10 12v6c0 8 7 13 16 13h10Z"/><circle cx="46" cy="58" r="2" fill="currentColor"/></svg>`,
    web: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="15" width="60" height="48" rx="4"/><path d="M10 27h60M20 21h1m7 0h1m7 0h1M27 39l-8 7 8 7m26-14 8 7-8 7m-7-16-8 18"/></svg>`,
    database: `<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="20" rx="25" ry="9"/><path d="M15 20v40c0 5 11 9 25 9s25-4 25-9V20M15 40c0 5 11 9 25 9s25-4 25-9"/></svg>`
  };
  function esc(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function duration(course) {
    const title = (course.titulo || "").toLowerCase();
    if (title.includes("python") || title.includes("phyton")) return "⌛ 22h";
    if (title.includes("html") || title.includes("web")) return "⌛ 18h";
    if (title.includes("banco") || title.includes("sql")) return "⌛ 16h";
    return "⌛ 12h";
  }
  function icon(course) {
    const text = `${course.titulo || ""} ${course.categoria || ""}`.toLowerCase();
    if (text.includes("python") || text.includes("phyton")) return icons.python;
    if (text.includes("web") || text.includes("html") || text.includes("javascript")) return icons.web;
    if (text.includes("banco") || text.includes("sql") || text.includes("dados")) return icons.database;
    return art;
  }
  function primeiroNome(user) {
    let nome = String(user?.nome || "").trim();
    // Evita exibir o endereço de e-mail como se fosse o nome de exibição.
    if (!nome || nome.includes("@")) nome = String(user?.email || "").split("@")[0];
    return nome.split(/[ ._-]+/).filter(Boolean)[0] || "";
  }
  async function setGreeting() {
    const token = localStorage.getItem("devcursosToken");
    if (!token) {
      greeting.hidden = true;
      if (accountLink) { accountLink.textContent = "Entrar"; accountLink.href = "login.html"; }
      return;
    }
    try {
      const response = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.usuario) throw new Error("Sessão inválida");
      const user = data.usuario;
      localStorage.setItem("devcursosUsuario", JSON.stringify(user));
      const nome = primeiroNome(user);
      if (!nome) { greeting.hidden = true; } else {
        const hour = new Date().getHours();
        const period = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
        greeting.hidden = false;
        greeting.textContent = `${period}, ${nome}.`;
      }
      if (accountLink) {
        accountLink.textContent = nome || "Minha conta";
        accountLink.href = "#";
        accountLink.onclick = (event) => {
          event.preventDefault();
          if (confirm("Deseja sair da sua conta?")) {
            ["devcursosToken", "devcursosLoggedIn", "devcursosUsuario"].forEach(key => localStorage.removeItem(key));
            window.location.reload();
          }
        };
      }
    } catch (error) {
      // Se a API não estiver acessível, não afirmar que há uma sessão válida.
      greeting.hidden = true;
      localStorage.removeItem("devcursosToken");
      localStorage.removeItem("devcursosLoggedIn");
      localStorage.removeItem("devcursosUsuario");
      if (accountLink) { accountLink.textContent = "Entrar"; accountLink.href = "login.html"; }
    }
  }
  function categories() {
    const values = ["Todos", ...new Set(courses.map(c => c.categoria).filter(Boolean))];
    filters.replaceChildren();
    values.forEach(value => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "filter" + (value === selectedCategory ? " active" : "");
      button.textContent = value; button.setAttribute("aria-pressed", String(value === selectedCategory));
      button.addEventListener("click", () => { selectedCategory = value; categories(); render(); });
      filters.appendChild(button);
    });
  }
  function render() {
    const term = (search.value || "").trim().toLocaleLowerCase("pt-BR");
    const shown = courses.filter(c =>
      (selectedCategory === "Todos" || c.categoria === selectedCategory) &&
      `${c.titulo || ""} ${c.descricao || ""} ${c.categoria || ""}`.toLocaleLowerCase("pt-BR").includes(term)
    );
    container.replaceChildren();
    if (!shown.length) {
      const empty = document.createElement("p"); empty.className = "empty";
      empty.textContent = courses.length ? "Nenhum curso encontrado para esse filtro." : "Nenhum curso disponível no momento.";
      container.appendChild(empty); return;
    }
    shown.forEach(course => {
      const card = document.createElement("article"); card.className = "course-card";
      const artBox = document.createElement("div"); artBox.className = "course-art"; artBox.innerHTML = icon(course);
      const title = document.createElement("h3"); title.textContent = course.titulo || "Curso";
      const meta = document.createElement("div"); meta.className = "course-meta";
      meta.textContent = `${duration(course)}${course.nivel ? " · " + course.nivel : ""}`;
      const desc = document.createElement("p"); desc.textContent = course.descricao || "Conheça os conceitos e pratique com as aulas deste curso.";
      const link = document.createElement("a"); link.className = "open-course"; link.href = `visualizarcurso.html?curso=${encodeURIComponent(course.id)}`; link.textContent = "Visualizar curso";
      card.append(artBox, title, meta, desc, link); container.appendChild(card);
    });
  }
  async function init() {
    setGreeting();
    search.addEventListener("input", render);
    try {
      const response = await fetch(`${API}/cursos`);
      if (!response.ok) throw new Error("Não foi possível carregar os cursos.");
      const data = await response.json();
      courses = Array.isArray(data) ? data : [];
      categories(); render();
    } catch (error) {
      container.innerHTML = `<p class="notice">Não foi possível carregar o catálogo. Confira se o backend está ativo.</p>`;
    }
  }
  init();
})();