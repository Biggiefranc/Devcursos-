const destinosPermitidos = new Set([
  "menudashbord.html",
  "cursos.html",
  "salvos.html",
  "visualizarcurso.html",
]);

export function destinoDepoisDoLogin(entrada, paginaLogin) {
  const base = new URL(".", paginaLogin);
  const padrao = new URL("menudashbord.html", base).href;
  if (!entrada) return padrao;

  try {
    const destino = new URL(entrada, base);
    if (destino.origin === base.origin &&
        (destino.protocol === "https:" || destino.protocol === "http:") &&
        !destino.username && !destino.password &&
        destino.pathname.startsWith(base.pathname) &&
        destinosPermitidos.has(destino.pathname.slice(base.pathname.length))) {
      return destino.href;
    }
  } catch {
    // Um destino inválido leva ao painel.
  }
  return padrao;
}
