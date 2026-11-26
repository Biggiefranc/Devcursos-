export function escapeHtml(value) {
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

export function courseCard(course) {
  const href = "visualizarcurso.html?curso=" + encodeURIComponent(course.id);
  const title = escapeHtml(course.titulo || "Formação");
  const hours = Number(course.duracao_horas);
  const duration = Number.isFinite(hours) && hours > 0
    ? hours < 1
      ? Math.max(1, Math.round(hours * 60)) + " min"
      : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(hours) + " h"
    : "";
  const metadata = [course.nivel, duration]
    .filter(Boolean)
    .map((value) => "<span>" + escapeHtml(value) + "</span>")
    .join("");

  return `
    <article class="course-card">
      ${course.categoria ? `<span class="course-category">${escapeHtml(course.categoria)}</span>` : ""}
      <h3>${title}</h3>
      ${course.descricao ? `<p class="course-description">${escapeHtml(course.descricao)}</p>` : ""}
      ${metadata ? `<div class="course-meta">${metadata}</div>` : ""}
      <p class="course-open">Ver currículo</p>
      <a class="course-card-link" href="${href}" aria-label="Ver currículo de ${title}"></a>
    </article>`;
}
