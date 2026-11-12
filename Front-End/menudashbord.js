/* =====================================================================
   DevCursos+ | Painel do aluno (SÓ INTERFACE)
   Tudo que aparece na tela vem do banco. Aqui só existe o mecanismo.

   Como alimentar (depois de buscar na API):
     DevCursos.carregar({ usuario, emAndamento, catalogo })
     DevCursos.carregarCurso({ id, titulo, descricao, categoria, secaoAtual, secoes })

   Formatos:
     usuario     { nome, moedas, sequencia, diasAtivos: ['2026-11-08', ...] }
     emAndamento [{ id, titulo, categoria, concluidas, total }]
     catalogo    [{ id, titulo, descricao, categoria }]
     secoes      [{ titulo, descricao, modulos: [{ id, titulo, tipo, status }] }]
       tipo    = 'aprender' | 'pratica'
       status  = 'concluido' | 'atual' | 'bloqueado'
       categoria = 'programacao' | 'frontend' | 'devops'

   Eventos que a interface dispara (document.addEventListener):
     devcursos:trocar-curso   -> { id }                           buscar as seções do curso
     devcursos:modulo-aberto  -> { cursoId, secao, moduloIndex, modulo }
     devcursos:iniciar-curso  -> { curso }                        clicou num curso que ainda não começou

   URL aceita: menudashbord.html?busca=react  e  ?categoria=devops
   ===================================================================== */

// ...existing code...
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/firebase-config";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    localStorage.removeItem("devcursos_token");
    localStorage.removeItem("devcursos_user");
    window.location.href = "login.html";
    return;
  }

  const token = await user.getIdToken();
  localStorage.setItem("devcursos_token", token);

  const userData = JSON.parse(localStorage.getItem("devcursos_user") || "{}");
  estado.usuario.nome = user.displayName || userData.nome || user.email?.split("@")[0] || "Aluno";
  renderSidebar();
});

// ...existing code...

const API_URL = 'http://localhost:3001';
const USAR_EXEMPLO = false;

const CATEGORIAS = { programacao: 'Programação', frontend: 'Front-end', devops: 'DevOps' };
const CAT_CLASS = { programacao: 'prog', frontend: 'front', devops: 'devops' };

// ===== ÍCONES (mesmo estilo de traço da página inicial) =====
const SVG = {
  programacao: '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>',
  frontend: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>',
  devops: '<line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
  chev: '<polyline points="9 18 15 12 9 6"></polyline>',
  left: '<polyline points="15 18 9 12 15 6"></polyline>',
  flame: '<path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"></path>',
  coin: '<circle cx="12" cy="12" r="9"></circle><path d="M14.5 9.5h-3.5a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3h-3.5M12 7v2M12 15v2"></path>',
  learn: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>',
  grid: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"></path><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"></path>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
};
const svg = (nome, s = 20) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[nome] || ''}</svg>`;

// ===== ESTADO (só em memória) =====
const estado = {
  usuario: { nome: '', moedas: 0, sequencia: 0, diasAtivos: [] },
  emAndamento: [],
  catalogo: [],
  cursoAtual: null,
  idCursoAtual: null,
  secao: 0,
  moduloAberto: null,
  categoria: 'programacao',
  busca: '',
  view: 'aprender',
};

// ===== HELPERS =====
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const emitir = (nome, detalhe) => document.dispatchEvent(new CustomEvent(nome, { detail: detalhe }));
const catIcone = (cat) => (SVG[cat] ? cat : 'frontend');
const pct = (c) => {
  const total = Number(c.total) || 0;
  return total ? Math.round(((Number(c.concluidas) || 0) / total) * 100) : 0;
};
function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

const secoesDoCurso = () => estado.cursoAtual?.secoes || [];
const secaoAtual = () => secoesDoCurso()[estado.secao] || null;

function montarIcones() {
  document.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = svg(el.dataset.icon, Number(el.dataset.size) || 20);
  });
}

// ===== NAVEGAÇÃO ENTRE TELAS =====
function mostrarView(nome) {
  estado.view = nome;
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${nome}`));
  document.querySelectorAll('#menu a[data-view]').forEach((a) => a.classList.toggle('active', a.dataset.view === nome));
  $('sidebar').classList.remove('open');
  window.scrollTo({ top: 0 });
}

// ===== SIDEBAR =====
function listaCursosAtuais() {
  return (estado.emAndamento.length ? estado.emAndamento : estado.catalogo).slice();
}

function renderMiniStreak() {
  const mini = $('miniWeek');
  const count = $('miniStreakCount');
  const diasAtivos = estado.usuario.diasAtivos || [];

  if (!mini || !count) return;

  const hoje = dayKey();
  const ultimo = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const key = dayKey(date);
    return {
      key,
      label: date.getDate(),
      done: diasAtivos.includes(key),
      today: key === hoje
    };
  });

  mini.innerHTML = ultimo.map((d) => `
    <div class="mini-day ${d.done ? 'done' : ''} ${d.today ? 'today' : ''}">${d.label}</div>
  `).join('');

  const total = (diasAtivos || []).filter((d) => d <= hoje).length;
  count.textContent = `${total} ${total === 1 ? 'dia' : 'dias'}`;
}

function renderSidebar() {
  const select = $('courseSelect');
  const lista = listaCursosAtuais();

  if (!lista.length) {
    select.innerHTML = '<option value="">Nenhum curso disponível</option>';
    select.disabled = true;
    if ($('sidebarBar')) $('sidebarBar').style.width = '0%';
    return;
  }

  if (!estado.idCursoAtual || !lista.some((c) => String(c.id) === String(estado.idCursoAtual))) {
    estado.idCursoAtual = String(lista[lista.length - 1].id);
  }

  select.disabled = false;
  select.innerHTML = lista.map((c) =>
    `<option value="${esc(c.id)}" ${String(c.id) === String(estado.idCursoAtual) ? 'selected' : ''}>${esc(c.titulo)}</option>`
  ).join('');

  const atual = lista.find((c) => String(c.id) === String(estado.idCursoAtual));
  if ($('sidebarBar')) $('sidebarBar').style.width = (atual ? pct(atual) : 0) + '%';

  const u = estado.usuario;
  $('userName').textContent = u.nome || 'Aluno';
  $('userAvatar').textContent = (u.nome || 'U').charAt(0).toUpperCase();
  renderMiniStreak();
}

// ===== APRENDER (seções + módulos) =====
function definirModuloPadrao() {
  const modulos = secaoAtual()?.modulos || [];
  const i = modulos.findIndex((m) => m.status === 'atual');
  estado.moduloAberto = i >= 0 ? i : null;
}

function anunciarModulo() {
  const i = estado.moduloAberto;
  const modulo = secaoAtual()?.modulos?.[i];
  if (modulo) {
    emitir('devcursos:modulo-aberto', {
      cursoId: estado.idCursoAtual, secao: estado.secao, moduloIndex: i, modulo,
    });
  }
}

function renderAprender() {
  const curso = estado.cursoAtual;
  const secoes = secoesDoCurso();
  const secao = secaoAtual();
  const total = secoes.length;

  const cat = curso?.categoria
    || estado.emAndamento.find((c) => String(c.id) === String(estado.idCursoAtual))?.categoria
    || 'frontend';
  $('learnBadge').className = `icon lg ${CAT_CLASS[cat] || 'front'}`;
  $('learnBadge').innerHTML = svg(catIcone(cat), 30);

  $('sectionTitle').textContent = secao?.titulo || curso?.titulo || 'Aprender';
  $('sectionSub').textContent = secao?.descricao || curso?.descricao || '';

  // pager: "SEÇÃO 1 DE 10"
  $('pagerLabel').textContent = `SEÇÃO ${total ? estado.secao + 1 : 0} DE ${total}`;
  $('prevSection').disabled = estado.secao <= 0;
  $('nextSection').disabled = !total || estado.secao >= total - 1;

  const modulos = secao?.modulos || [];
  $('learnEmpty').hidden = modulos.length > 0;

  $('modules').innerHTML = modulos.map((m, i) => {
    const status = m.status || 'bloqueado';
    const aberto = estado.moduloAberto === i && status !== 'bloqueado';
    const tipo = m.tipo === 'pratica' ? 'pratica' : 'aprender';
    const classe = status === 'atual' ? 'current' : status === 'concluido' ? 'done' : 'locked';
    const icone = status === 'concluido' ? `<span class="st done">${svg('check', 16)}</span>`
      : status === 'bloqueado' ? `<span class="st lock">${svg('lock', 18)}</span>`
        : `<span class="st chev">${svg('chev', 20)}</span>`;
    return `
      <article class="module ${classe} ${aberto ? 'open' : ''}" data-i="${i}">
        <button class="module-head" type="button" ${status === 'bloqueado' ? 'disabled' : ''}>
          <span class="num">${String(i + 1).padStart(2, '0')}</span>
          <span class="module-title">${esc(m.titulo)}</span>
          <span class="chip ${tipo}">${tipo === 'pratica' ? 'Prática' : 'Aprender'}</span>
          ${icone}
        </button>
        <div class="module-body">
          <div class="module-content" data-modulo-id="${esc(m.id)}"></div>
        </div>
      </article>`;
  }).join('');
}

function irSecao(delta) {
  const novo = estado.secao + delta;
  if (novo < 0 || novo >= secoesDoCurso().length) return;
  estado.secao = novo;
  definirModuloPadrao();
  renderAprender();
  anunciarModulo();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clicarModulo(i) {
  const modulo = secaoAtual()?.modulos?.[i];
  if (!modulo || modulo.status === 'bloqueado') return;
  estado.moduloAberto = estado.moduloAberto === i ? null : i;
  renderAprender();
  if (estado.moduloAberto !== null) anunciarModulo();
}

// ===== CURSOS (progresso + sequência + catálogo) =====
function cardCurso(c, extra, rodape) {
  const cat = CATEGORIAS[c.categoria] ? c.categoria : 'frontend';
  return `
    <a href="#" class="cat ${CAT_CLASS[cat]} ${extra.selecionado ? 'selected' : ''}" data-id="${esc(c.id)}">
      <span class="icon">${svg(catIcone(cat), 26)}</span>
      <small>${esc(CATEGORIAS[cat])}</small>
      <h3>${esc(c.titulo)}</h3>
      ${extra.corpo || ''}
      ${rodape}
    </a>`;
}

function renderProgresso() {
  const lista = estado.emAndamento;
  $('progressEmpty').hidden = lista.length > 0;
  $('progressGrid').innerHTML = lista.map((c) => cardCurso(
    c,
    {
      selecionado: String(c.id) === String(estado.idCursoAtual),
      corpo: `
        <div class="info"><span>${pct(c)}% completo</span><span>${Number(c.concluidas) || 0}/${Number(c.total) || 0}</span></div>
        <div class="bar"><div class="bar-fill" style="width:${pct(c)}%"></div></div>`,
    },
    '<span class="go">Continuar →</span>'
  )).join('');
}

function renderSequencia() {
  const u = estado.usuario;
  const ativos = u.diasAtivos || [];
  const nomes = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  let html = '';
  for (let i = 6; i >= 0; i--) {
    const date = daysAgo(i);
    const ativo = ativos.includes(dayKey(date));
    html += `
      <div class="day ${i === 0 ? 'today' : ''}">
        ${nomes[date.getDay()]}
        <div class="dot ${ativo ? 'done' : ''}">${ativo ? svg('flame', 18) : ''}</div>
      </div>`;
  }
  $('week').innerHTML = html;

  const hoje = ativos.includes(dayKey());
  const s = u.sequencia || 0;
  $('streakText').textContent = s === 0
    ? 'Estude hoje para começar sua sequência!'
    : hoje
      ? `Você está há ${s} ${s === 1 ? 'dia' : 'dias'} seguidos. Volte amanhã!`
      : `Sequência de ${s} ${s === 1 ? 'dia' : 'dias'}. Estude hoje para não perder!`;
}

function montarAbas() {
  $('tabs').innerHTML = Object.entries(CATEGORIAS).map(([cat, nome]) =>
    `<button class="tab" type="button" data-cat="${cat}" role="tab">${nome}</button>`
  ).join('');
}

function renderCatalogo() {
  const buscando = estado.busca !== '';

  // com busca: procura em todas as categorias. Sem busca: filtra pela aba.
  document.querySelectorAll('#tabs .tab').forEach((t) => t.classList.toggle('active', t.dataset.cat === estado.categoria));
  $('tabs').hidden = buscando;

  const info = $('searchInfo');
  info.hidden = !buscando;
  if (buscando) {
    info.innerHTML = `<span>Resultados para <b>“${esc(estado.busca)}”</b></span><button type="button" id="limparBusca">Limpar</button>`;
  }

  const termo = norm(estado.busca);
  const lista = estado.catalogo.filter((c) => buscando
    ? norm(c.titulo).includes(termo) || norm(c.descricao).includes(termo)
    : c.categoria === estado.categoria);

  const vazio = $('pathsEmpty');
  vazio.hidden = lista.length > 0;
  vazio.textContent = buscando ? 'Nenhum curso encontrado para essa busca.' : 'Nenhum curso nessa categoria ainda.';

  $('pathsGrid').innerHTML = lista.map((c) => {
    const andamento = estado.emAndamento.find((x) => String(x.id) === String(c.id));
    return cardCurso(
      c,
      {
        corpo: `<p>${esc(c.descricao)}</p>` + (andamento
          ? `<div class="info"><span>${pct(andamento)}% completo</span><span>${Number(andamento.concluidas) || 0}/${Number(andamento.total) || 0}</span></div>
             <div class="bar"><div class="bar-fill" style="width:${pct(andamento)}%"></div></div>`
          : ''),
      },
      `<span class="go">${andamento ? 'Continuar →' : 'Ver curso →'}</span>`
    );
  }).join('');
}

function aplicarBusca(termo) {
  estado.busca = String(termo || '').trim();
  renderCatalogo();
}

// ===== AÇÕES =====
function trocarCurso(id) {
  if (!id || String(id) === String(estado.idCursoAtual)) return;
  estado.idCursoAtual = id;
  estado.cursoAtual = null;
  estado.secao = 0;
  estado.moduloAberto = null;
  renderSidebar();
  renderAprender();
  renderProgresso();
  renderCatalogo();
  emitir('devcursos:trocar-curso', { id });
  if (USAR_EXEMPLO) carregarCurso(exemploCurso(id));
}

function abrirCurso(id) {
  trocarCurso(id);
  mostrarView('aprender');
}

function renderTudo() {
  renderSidebar();
  renderAprender();
  renderProgresso();
  renderSequencia();
  renderCatalogo();
}

// ===== API PÚBLICA (o que vem do banco entra por aqui) =====
function normalizarCategoria(categoria) {
  const texto = String(categoria || '').trim().toLowerCase();
  if (texto.includes('program')) return 'programacao';
  if (texto.includes('front')) return 'frontend';
  if (texto.includes('devops') || texto.includes('dev ops')) return 'devops';
  return 'programacao';
}

function mapearCursoParaCatalogo(curso) {
  return {
    id: curso.id,
    titulo: curso.titulo,
    descricao: curso.descricao || 'Curso disponível no catálogo DevCursos+.',
    categoria: normalizarCategoria(curso.categoria)
  };
}

async function carregarDadosDoBanco() {
  try {
    const resposta = await fetch(`${API_URL}/cursos`);
    if (!resposta.ok) throw new Error(`Erro ao consultar /cursos (${resposta.status})`);

    const cursos = await resposta.json();
    const catalogo = (Array.isArray(cursos) ? cursos : []).map(mapearCursoParaCatalogo);
    const ordenado = [...catalogo].sort((a, b) => Number(b.id) - Number(a.id));

    carregar({ catalogo: ordenado, emAndamento: ordenado.slice(0, 1) });
    estado.idCursoAtual = String(ordenado[0]?.id || '');
  } catch (erro) {
    console.error('Erro ao carregar cursos do banco:', erro);
    $('pathsEmpty').hidden = false;
    $('pathsEmpty').textContent = 'Não foi possível carregar os cursos do banco local.';
  }
}

function carregar(dados = {}) {
  if (dados.usuario) estado.usuario = { ...estado.usuario, ...dados.usuario };
  if (dados.emAndamento) estado.emAndamento = dados.emAndamento;
  if (dados.catalogo) estado.catalogo = dados.catalogo;

  const cursosAtuais = listaCursosAtuais();
  const aindaExiste = cursosAtuais.some((c) => String(c.id) === String(estado.idCursoAtual));
  if (!aindaExiste && cursosAtuais.length) {
    estado.idCursoAtual = String(cursosAtuais[cursosAtuais.length - 1].id);
  }

  renderTudo();
}

function carregarCurso(curso) {
  estado.cursoAtual = curso;
  estado.idCursoAtual = curso.id;
  const total = (curso.secoes || []).length;
  estado.secao = Math.min(Math.max(Number(curso.secaoAtual) || 0, 0), Math.max(total - 1, 0));
  definirModuloPadrao();
  renderSidebar();
  renderAprender();
  renderProgresso();
  anunciarModulo();
}

window.DevCursos = { carregar, carregarCurso };

// ===== USUÁRIO LOGADO (nome da conta) =====
async function carregarUsuario() {
  const token = localStorage.getItem('devcursos_token');
  if (!token) {
    console.warn('Sem token no localStorage, voltando pro login');
    window.location.href = 'login.html';
    return;
  }
  try {
    const res = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) {
      console.warn('Token inválido ou expirado');
      localStorage.removeItem('devcursos_token');
      window.location.href = 'login.html';
      return;
    }
    if (!res.ok) throw new Error(`/me respondeu ${res.status}`);
    const user = await res.json();
    estado.usuario.nome = user.nome;
    renderSidebar();
  } catch (err) {
    console.error('Erro ao buscar o usuário:', err);
  }
}

// ===== EVENTOS DA INTERFACE =====
if ($('menu')) {
  $('menu').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    if (a.dataset.view) mostrarView(a.dataset.view);
  });
}
if ($('menuToggle')) $('menuToggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));
if ($('courseSelect')) $('courseSelect').addEventListener('change', (e) => trocarCurso(e.target.value));
if ($('logoutBtn')) $('logoutBtn').addEventListener('click', async () => {
  localStorage.removeItem('devcursos_token');
  localStorage.removeItem('devcursos_user');
  if (auth) {
    await signOut(auth);
  }
  window.location.href = 'login.html';
});

if ($('prevSection')) $('prevSection').addEventListener('click', () => irSecao(-1));
if ($('nextSection')) $('nextSection').addEventListener('click', () => irSecao(1));
if ($('modules')) $('modules').addEventListener('click', (e) => {
  const mod = e.target.closest('.module');
  if (!mod || !e.target.closest('.module-head')) return;
  clicarModulo(Number(mod.dataset.i));
});

if ($('progressGrid')) $('progressGrid').addEventListener('click', (e) => {
  const card = e.target.closest('.cat');
  if (!card) return;
  e.preventDefault();
  window.location.href = `visualizarcurso.html?curso=${encodeURIComponent(card.dataset.id)}`;
});
if ($('tabs')) $('tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  estado.categoria = tab.dataset.cat;
  renderCatalogo();
});
if ($('pathsGrid')) $('pathsGrid').addEventListener('click', (e) => {
  const card = e.target.closest('.cat');
  if (!card) return;
  e.preventDefault();
  window.location.href = `visualizarcurso.html?curso=${encodeURIComponent(card.dataset.id)}`;
});
if ($('searchInfo')) $('searchInfo').addEventListener('click', (e) => {
  if (e.target.id !== 'limparBusca') return;
  $('q').value = '';
  aplicarBusca('');
});

// busca do topo: leva pra tela de cursos
if ($('searchForm')) $('searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  aplicarBusca($('q').value);
  mostrarView('cursos');
});
if ($('q')) $('q').addEventListener('input', () => {
  if (estado.view === 'cursos') aplicarBusca($('q').value);
});

// ===== EXEMPLO (só aparece com USAR_EXEMPLO = true) =====
function exemploDados() {
  return {
    usuario: {
      nome: 'Aluno Exemplo', moedas: 220, sequencia: 3,
      diasAtivos: [dayKey(), dayKey(daysAgo(1)), dayKey(daysAgo(2))],
    },
    emAndamento: [
      { id: 1, titulo: 'Introdução ao HTML', categoria: 'frontend', concluidas: 2, total: 10 },
      { id: 2, titulo: 'Lógica de Programação', categoria: 'programacao', concluidas: 1, total: 12 },
    ],
    catalogo: [
      { id: 1, titulo: 'Introdução ao HTML', descricao: 'Descrição do curso.', categoria: 'frontend' },
      { id: 3, titulo: 'CSS Moderno', descricao: 'Descrição do curso.', categoria: 'frontend' },
      { id: 2, titulo: 'Lógica de Programação', descricao: 'Descrição do curso.', categoria: 'programacao' },
      { id: 4, titulo: 'Node.js', descricao: 'Descrição do curso.', categoria: 'programacao' },
      { id: 5, titulo: 'Git e GitHub', descricao: 'Descrição do curso.', categoria: 'devops' },
    ],
  };
}

function exemploCurso(id) {
  const base = exemploDados().catalogo.find((c) => String(c.id) === String(id)) || {};
  return {
    id,
    titulo: base.titulo || 'Curso',
    descricao: 'Descrição do curso.',
    categoria: base.categoria || 'frontend',
    secoes: Array.from({ length: 10 }, (_, s) => ({
      titulo: `Seção ${s + 1}`,
      descricao: 'Descrição da seção.',
      modulos: Array.from({ length: 4 }, (_, m) => ({
        id: `${s}-${m}`,
        titulo: `Módulo ${m + 1}`,
        tipo: m === 2 ? 'pratica' : 'aprender',
        status: s > 0 ? 'bloqueado' : m === 0 ? 'concluido' : m === 1 ? 'atual' : 'bloqueado',
      })),
    })),
  };
}

// ===== INÍCIO =====
async function iniciar() {
  montarIcones();
  montarAbas();

  // ?busca=... e ?categoria=... (a busca da página inicial manda pra cá)
  const params = new URLSearchParams(window.location.search);
  const busca = (params.get('busca') || '').trim();
  const cat = params.get('categoria');
  let viewInicial = null;
  if (cat && CATEGORIAS[cat]) { estado.categoria = cat; viewInicial = 'cursos'; }
  if (busca) { estado.busca = busca; $('q').value = busca; viewInicial = 'cursos'; }

  renderTudo();
  if (viewInicial) mostrarView(viewInicial);

  if (USAR_EXEMPLO) {
    carregar(exemploDados());
    return;
  }

  await carregarDadosDoBanco();
  await carregarUsuario();
  emitir('devcursos:pronto');
}

iniciar();