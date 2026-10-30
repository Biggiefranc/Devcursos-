(() => {
  const API = "http://localhost:3000";
  const params = new URLSearchParams(location.search);
  const id = params.get("curso");
  const root = document.getElementById("courseDetail");
  const accountLink = document.getElementById("accountLink");
  const favoriteKey = "devcursos-favoritos";
  let user = null;
  let completed = new Set();

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function duration(course) {
    const t = (course.titulo || "").toLowerCase();
    if (t.includes("python") || t.includes("phyton")) return "⌛ 22h";
    if (t.includes("html") || t.includes("web")) return "⌛ 18h";
    if (t.includes("banco") || t.includes("sql")) return "⌛ 16h";
    return "⌛ 12h";
  }
  function illustration(course) {
    const s = `${course.titulo || ""} ${course.categoria || ""}`.toLowerCase();
    if (s.includes("python") || s.includes("phyton")) return `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M39 12c-13 0-13 6-13 13v8h18v5H20c-7 0-10 5-10 13s4 13 12 13h9v-9c0-7 5-12 12-12h12c6 0 10-5 10-12V25c0-8-7-13-16-13H39Z"/><circle cx="35" cy="22" r="2" fill="currentColor"/><path d="M42 68c13 0 13-6 13-13v-8H37v-5h24c7 0 10-5 10-13s-4-13-12-13h-9v9c0 7-5 12-12 12H26c-6 0-10 5-10 12v6c0 8 7 13 16 13h10Z"/></svg>`;
    if (s.includes("web") || s.includes("html") || s.includes("javascript")) return `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="15" width="60" height="48" rx="4"/><path d="M10 27h60M27 39l-8 7 8 7m26-14 8 7-8 7m-7-16-8 18"/></svg>`;
    return `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M14 25 40 12l26 13-26 13-26-13Z"/><path d="M23 31v18c10 9 24 9 34 0V31M66 26v20"/><circle cx="66" cy="50" r="4"/></svg>`;
  }
  async function get(url, options = {}) {
    const r = await fetch(url, options);
    const d = await r.json().catch(() => null);
    if (!r.ok) throw new Error(d?.mensagem || "Erro ao consultar o curso.");
    return d;
  }
  function token() { return localStorage.getItem("devcursosToken") || ""; }
  function authHeaders() {
    return token() ? { Authorization: `Bearer ${token()}` } : {};
  }
  function isLogged() { return Boolean(token() && user); }
  function getFavorites() {
    try { return JSON.parse(localStorage.getItem(favoriteKey) || "[]").map(String); }
    catch { return []; }
  }
  function displayName(data) {
    let name = String(data?.nome || "").trim();
    if (!name || name.includes("@")) name = String(data?.email || "").split("@")[0];
    return name.split(/[ ._-]+/).filter(Boolean)[0] || "Minha conta";
  }
  async function updateAccount() {
    if (!accountLink) return;
    const currentToken = token();
    if (!currentToken) {
      accountLink.textContent = "Entrar";
      accountLink.href = "login.html";
      return;
    }
    try {
      const data = await get(`${API}/me`, { headers: { Authorization: `Bearer ${currentToken}` } });
      if (!data?.usuario) throw new Error("Sessão inválida");
      user = data.usuario;
      localStorage.setItem("devcursosUsuario", JSON.stringify(user));
      accountLink.textContent = displayName(user);
      accountLink.href = "#";
      accountLink.onclick = event => {
        event.preventDefault();
        if (confirm("Deseja sair da sua conta?")) {
          ["devcursosToken", "devcursosLoggedIn", "devcursosUsuario"].forEach(k => localStorage.removeItem(k));
          location.href = "menudashbord.html";
        }
      };
    } catch {
      user = null;
      ["devcursosToken", "devcursosLoggedIn", "devcursosUsuario"].forEach(k => localStorage.removeItem(k));
      accountLink.textContent = "Entrar";
      accountLink.href = "login.html";
      accountLink.onclick = null;
    }
  }
  async function loadProgress(courseId) {
    completed = new Set();
    if (!token() || !user) return;
    try {
      const data = await get(`${API}/cursos/${encodeURIComponent(courseId)}/progresso`, {
        headers: authHeaders()
      });
      completed = new Set((data.aulasConcluidas || []).map(String));
    } catch (error) {
      console.error("Não foi possível carregar o progresso salvo:", error);
    }
  }
  function render(course, modules) {
    const allLessons = modules.flatMap(m => m.aulas || []);
    const total = allLessons.length;
    const done = allLessons.filter(a => completed.has(String(a.id))).length;
    const percent = total ? Math.round(done / total * 100) : 0;
    const fav = getFavorites().includes(String(course.id));
    const start = isLogged()
      ? `<a class="primary-button" href="cursos.html?curso=${encodeURIComponent(course.id)}${allLessons.length ? `#aula-${encodeURIComponent(allLessons.find(a => !completed.has(String(a.id)))?.id || allLessons[0].id)}` : ""}">Começar agora</a>`
      : `<a class="login-button" href="login.html">Entrar</a>`;
    root.innerHTML = `
      <section class="detail-main">
        <div class="detail-actions">
          <a class="text-button" href="menudashbord.html">← Voltar ao início</a>
          <button id="favoriteBtn" class="favorite ${fav ? "active" : ""}" type="button" aria-pressed="${fav}">${fav ? "♥ Favoritado" : "♡ Favoritar curso"}</button>
        </div>
        <div class="course-hero">
          <div class="course-art">${illustration(course)}</div>
          <div><p class="muted">${esc(course.categoria || "Curso")}${course.nivel ? " · " + esc(course.nivel) : ""}</p>
            <h1>${esc(course.titulo || "Curso")}</h1>
            <p>${esc(duration(course))}</p>
            <p>${esc(course.descricao || "Este curso apresenta os conceitos essenciais da área e acompanha você ao longo dos módulos.")}</p>
          </div>
        </div>
        <h2 class="module-heading">Módulos</h2>
        <div id="modules">${modules.length ? modules.map((m, i) => `<section class="module ${i === 0 ? "open" : ""}">
          <button class="module-toggle" type="button" aria-expanded="${i === 0}"><span>${i + 1}. ${esc(m.titulo || "Introdução")}</span><span aria-hidden="true">🔽</span></button>
          <div class="lesson-list">${(m.aulas || []).length ? m.aulas.map((a, j) => {
            const isDone = completed.has(String(a.id));
            const href = isLogged() ? `cursos.html?curso=${encodeURIComponent(course.id)}#aula-${encodeURIComponent(a.id)}` : "login.html";
            return `<a class="lesson ${isDone ? "completed" : ""}" href="${href}"><span>${i + 1}.${j + 1} &nbsp; ${esc(a.titulo || `Aula ${j + 1}`)}</span><span aria-label="${isDone ? "Concluída" : "Pendente"}">${isDone ? "✓" : ""}</span></a>`;
          }).join("") : `<p class="small-note">As aulas deste módulo ainda não foram cadastradas.</p>`}</div>
        </section>`).join("") : `<p class="notice">Este curso ainda não possui módulos cadastrados.</p>`}</div>
        <div class="enroll-row"><p class="small-note">${isLogged() ? `${done} de ${total} aulas concluídas.` : "Seu progresso aparecerá aqui quando você entrar na sua conta."}</p>${start}</div>
      </section>
      <aside class="progress-panel"><h3>Seu progresso</h3><div class="progress-number">${percent}%</div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><p class="small-note">${done} de ${total} aulas concluídas</p></aside>`;
    document.getElementById("favoriteBtn").addEventListener("click", () => {
      const favorites = getFavorites(); const key = String(course.id); const index = favorites.indexOf(key);
      if (index >= 0) favorites.splice(index, 1); else favorites.push(key);
      localStorage.setItem(favoriteKey, JSON.stringify(favorites));
      render(course, modules);
    });
    root.querySelectorAll(".module-toggle").forEach(btn => btn.addEventListener("click", () => {
      const section = btn.closest(".module"); const open = section.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    }));
  }
  async function init() {
    // file:// tem uma origem diferente e não compartilha a sessão do Live Server.
    if (location.protocol === "file:") {
      root.innerHTML = `<p class="notice">Abra o catálogo pelo Live Server para manter a sessão e carregar o curso corretamente: <a href="http://127.0.0.1:5500/Front-End/menudashbord.html">abrir DevCursos+</a>.</p>`;
      return;
    }
    await updateAccount();
    if (!id) {
      root.innerHTML = `<p class="notice">Selecione um curso no <a href="menudashbord.html">catálogo</a> para visualizar os módulos e o progresso.</p>`;
      return;
    }
    try {
      const course = await get(`${API}/cursos/${encodeURIComponent(id)}`);
      const modulesData = await get(`${API}/cursos/${encodeURIComponent(id)}/modulos`);
      const modules = await Promise.all((Array.isArray(modulesData) ? modulesData : []).map(async m => {
        const lessons = await get(`${API}/modulos/${encodeURIComponent(m.id)}/aulas`);
        return { ...m, aulas: Array.isArray(lessons) ? lessons : [] };
      }));
      await loadProgress(course.id);
      render(course, modules);
    } catch (e) {
      root.innerHTML = `<p class="notice">${esc(e.message)} Confira se o backend está ativo.</p>`;
    }
  }
  init();
})();
