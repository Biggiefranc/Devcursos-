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

export function courseCard(course, index = 0, options = {}) {
  const id = encodeURIComponent(course.id);
  const category = escapeHtml(course.categoria || "Formação");
  const level = escapeHtml(course.nivel || "Não informado");
  const hours = Number(course.duracao_horas);
  const duration =
    Number.isFinite(hours) && hours > 0
      ? hours < 1
        ? Math.round(hours * 60) + " MIN"
        : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
            hours,
          ) + " H"
      : "A DEFINIR";
  const technologies =
    Array.isArray(course.tecnologias) && course.tecnologias.length
      ? course.tecnologias.slice(0, 4).map(escapeHtml).join(" · ")
      : "A DEFINIR";
  const project = course.projeto_final
    ? escapeHtml(course.projeto_final)
    : "A DEFINIR";
  const description = escapeHtml(
    course.descricao ||
      "Consulte o currículo desta formação e comece pelo módulo inicial.",
  );
  const title = escapeHtml(course.titulo || "Formação");
  const href = options.href || "visualizarcurso.html?curso=" + id;

  return (
    '<article class="course-card" data-reveal>' +
    '<div class="course-card-head"><span class="course-index">DC / ' +
    String(index + 1).padStart(2, "0") +
    '</span><span class="course-category">' +
    category +
    "</span></div>" +
    "<h3>" +
    title +
    '</h3><p class="course-description">' +
    description +
    "</p>" +
    '<div class="course-meta"><span>NÍVEL ' +
    level +
    "</span><span>" +
    duration +
    "</span><span>TECNOLOGIAS " +
    technologies +
    "</span><span>PROJETO " +
    project +
    "</span></div>" +
    '<p class="course-open">Ver currículo</p><a class="course-card-link" href="' +
    href +
    '" aria-label="Ver currículo: ' +
    title +
    '"></a></article>'
  );
}
