import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true });
const urlWeb = /^https?:\/\//i;
function ehUrlWeb(valor) {
  if (!urlWeb.test(valor)) return false;
  try {
    new URL(valor);
    return true;
  } catch {
    return false;
  }
}
markdown.validateLink = ehUrlWeb;

for (const regra of ["heading_open", "heading_close"]) {
  markdown.renderer.rules[regra] = (tokens, indice, opcoes, ambiente, renderizador) => {
    const token = tokens[indice];
    token.tag = `h${Math.min(Number(token.tag.slice(1)) + 1, 6)}`;
    return renderizador.renderToken(tokens, indice, opcoes);
  };
}

const configuracao = {
  ALLOWED_TAGS: [
    "a", "blockquote", "br", "code", "del", "em", "h2", "h3", "h4", "h5", "h6", "hr",
    "img", "li", "ol", "p", "pre", "s", "strong", "table", "tbody", "td", "th", "thead", "tr", "ul",
  ],
  ALLOWED_ATTR: ["alt", "class", "href", "src", "start", "title"],
  ALLOWED_URI_REGEXP: urlWeb,
  ALLOW_ARIA_ATTR: false,
  ALLOW_DATA_ATTR: false,
  RETURN_DOM_FRAGMENT: true,
};

function sanitizar(html) {
  const fragmento = DOMPurify.sanitize(html, configuracao);
  for (const link of fragmento.querySelectorAll("a[href]")) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  for (const imagem of fragmento.querySelectorAll("img")) {
    if (!ehUrlWeb(imagem.getAttribute("src") || "")) {
      imagem.replaceWith(imagem.alt);
      continue;
    }
    imagem.loading = "lazy";
    imagem.referrerPolicy = "no-referrer";
  }
  return fragmento;
}

function urlVideo(imagem) {
  const endereco = new URL(imagem.src);
  let id;
  if (endereco.hostname === "youtu.be") {
    id = endereco.pathname.slice(1);
  } else if (["youtube.com", "www.youtube.com"].includes(endereco.hostname)) {
    id = endereco.pathname === "/watch"
      ? endereco.searchParams.get("v")
      : endereco.pathname.match(/^\/embed\/([^/]+)$/)?.[1];
  }
  if (endereco.port || endereco.username || endereco.password || !/^[\w-]{11}$/.test(id || "")) {
    return null;
  }

  const embed = new URL(`https://www.youtube.com/embed/${id}`);
  const inicio = endereco.searchParams.get("start") ?? endereco.searchParams.get("t");
  const lista = endereco.searchParams.get("list");
  const indice = endereco.searchParams.get("index");
  if (/^\d{1,8}s?$/.test(inicio || "")) embed.searchParams.set("start", inicio.replace(/s$/, ""));
  if (/^[\w-]{1,80}$/.test(lista || "")) embed.searchParams.set("list", lista);
  if (/^\d{1,5}$/.test(indice || "")) embed.searchParams.set("index", indice);
  return embed.href;
}

export function renderizarMarkdown(texto) {
  const fragmento = sanitizar(markdown.render(String(texto ?? "")));
  for (const imagem of fragmento.querySelectorAll("p > img[src]")) {
    const paragrafo = imagem.parentElement;
    if (paragrafo.children.length !== 1 || paragrafo.textContent.trim()) continue;
    const endereco = urlVideo(imagem);
    if (!endereco) continue;

    const video = document.createElement("iframe");
    video.src = endereco;
    video.title = imagem.alt || "Vídeo do YouTube";
    video.loading = "lazy";
    video.referrerPolicy = "strict-origin-when-cross-origin";
    video.allow = "encrypted-media; picture-in-picture";
    video.allowFullscreen = true;
    const caixa = document.createElement("div");
    caixa.className = "video-wrapper";
    caixa.append(video);
    paragrafo.replaceWith(caixa);
  }
  return fragmento;
}

export function renderizarInlineMarkdown(texto) {
  return sanitizar(markdown.renderInline(String(texto ?? "")));
}
