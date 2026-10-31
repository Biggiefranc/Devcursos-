/* =====================================================
   Dev Cursos+ — tema compartilhado (menu + persistência)
   Uso em qualquer tela:
     1) no <head>, antes do CSS, pra não piscar a cor errada:
        <script>try{document.documentElement.dataset.tema=localStorage.getItem('devcursos-tema')||'sistema'}catch(e){}</script>
     2) no <head>:  <link rel="stylesheet" href="tema.css">
     3) no fim do <body>: <script src="tema.js"></script>
   Se a página tiver <header class="topbar">, o menu de tema é
   inserido sozinho dentro dele.
   ===================================================== */
(function () {
  const CHAVE = 'devcursos-tema';
  const OPCOES = [
    { valor: 'sistema', rotulo: 'Padrão do sistema' },
    { valor: 'claro',   rotulo: 'Claro' },
    { valor: 'escuro',  rotulo: 'Escuro' }
  ];

  function lerTema() {
    try { return localStorage.getItem(CHAVE) || 'sistema'; } catch (e) { return 'sistema'; }
  }

  function aplicar(tema) {
    document.documentElement.dataset.tema = tema;
    document.querySelectorAll('.tema-lista button').forEach(b => {
      b.setAttribute('aria-checked', String(b.dataset.t === tema));
    });
  }

  function salvar(tema) {
    try { localStorage.setItem(CHAVE, tema); } catch (e) {}
    aplicar(tema);
  }

  function montarMenu() {
    const topo = document.querySelector('.topbar');
    if (!topo || topo.querySelector('.tema-menu')) return;

    const wrap = document.createElement('div');
    wrap.className = 'tema-menu';

    const gatilho = document.createElement('button');
    gatilho.className = 'tema-trigger';
    gatilho.setAttribute('aria-haspopup', 'true');
    gatilho.setAttribute('aria-expanded', 'false');
    gatilho.innerHTML = '<span class="icone" aria-hidden="true">◐</span><span class="texto">Tema</span>';

    const lista = document.createElement('div');
    lista.className = 'tema-lista';
    lista.setAttribute('role', 'menu');
    lista.hidden = true;

    OPCOES.forEach(o => {
      const b = document.createElement('button');
      b.dataset.t = o.valor;
      b.setAttribute('role', 'menuitemradio');
      b.setAttribute('aria-checked', 'false');
      b.innerHTML = `<span>${o.rotulo}</span><span class="marca" aria-hidden="true">✓</span>`;
      b.onclick = () => {
        salvar(o.valor);
        fechar();
        gatilho.focus();
      };
      lista.appendChild(b);
    });

    function abrir() {
      lista.hidden = false;
      gatilho.setAttribute('aria-expanded', 'true');
    }
    function fechar() {
      lista.hidden = true;
      gatilho.setAttribute('aria-expanded', 'false');
    }

    gatilho.onclick = e => {
      e.stopPropagation();
      lista.hidden ? abrir() : fechar();
    };
    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) fechar();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') fechar();
    });

    wrap.append(gatilho, lista);

    // Coloca o menu antes do botão "voltar", se existir; senão, no fim do topo
    const voltar = topo.querySelector('.back');
    if (voltar) topo.insertBefore(wrap, voltar);
    else topo.appendChild(wrap);

    aplicar(lerTema());
  }

  // Expõe pra telas que quiserem trocar o tema por código
  window.DevTema = { aplicar: salvar, atual: lerTema };

  aplicar(lerTema());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montarMenu);
  } else {
    montarMenu();
  }
})();