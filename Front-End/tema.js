
/* =====================================================
   Dev Cursos+ — tema compartilhado (menu + persistência)
   Tema padrão: ESCURO
   ===================================================== */

(function () {
    'use strict';

    const CHAVE = 'devcursos-tema';
    const MEDIA_DARK = '(prefers-color-scheme: dark)';

    const OPCOES = [
        { valor: 'sistema', rotulo: 'Padrão do sistema' },
        { valor: 'claro', rotulo: 'Claro' },
        { valor: 'escuro', rotulo: 'Escuro' }
    ];

    function iconeDoTema(tema) {
        const temaResolvido = tema === 'sistema'
            ? (window.matchMedia && window.matchMedia(MEDIA_DARK).matches ? 'escuro' : 'claro')
            : tema;

        if (temaResolvido === 'claro') {
            return `
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="4.2"></circle>
                    <path d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.5 1.5M17.8 17.8l1.5 1.5M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.5-1.5M17.8 6.2l1.5-1.5"></path>
                </svg>
            `;
        }

        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 15.2A7.7 7.7 0 0 1 8.8 4a8.3 8.3 0 1 0 11.2 11.2Z"></path>
            </svg>
        `;
    }

    function lerTema() {
        try {
            return localStorage.getItem(CHAVE) || 'escuro';
        } catch (e) {
            return 'escuro';
        }
    }

    function aplicar(tema) {
        const escolhido = tema || 'escuro';
        document.documentElement.dataset.tema = escolhido;

        const gatilho = document.querySelector('.tema-trigger');
        if (gatilho) {
            gatilho.dataset.tema = escolhido;
            const icone = gatilho.querySelector('.tema-icone');
            if (icone) {
                icone.innerHTML = iconeDoTema(escolhido);
            }
        }

        document.querySelectorAll('.tema-lista button').forEach(function (botao) {
            botao.setAttribute('aria-checked', String(botao.dataset.t === escolhido));
        });
    }

    function salvar(tema) {
        try {
            localStorage.setItem(CHAVE, tema);
        } catch (e) {}

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
        gatilho.innerHTML = `
            <span class="tema-icone" aria-hidden="true">${iconeDoTema(lerTema())}</span>
            <span class="texto">Tema</span>
        `;

        const lista = document.createElement('div');
        lista.className = 'tema-lista';
        lista.setAttribute('role', 'menu');
        lista.hidden = true;

        OPCOES.forEach(function (opcao) {
            const botao = document.createElement('button');
            botao.dataset.t = opcao.valor;
            botao.setAttribute('role', 'menuitemradio');
            botao.setAttribute('aria-checked', 'false');
            botao.innerHTML = `
                <span>${opcao.rotulo}</span>
                <span class="marca" aria-hidden="true">✓</span>
            `;

            botao.onclick = function () {
                salvar(opcao.valor);
                fechar();
                gatilho.focus();
            };

            lista.appendChild(botao);
        });

        function abrir() {
            lista.hidden = false;
            gatilho.setAttribute('aria-expanded', 'true');
        }

        function fechar() {
            lista.hidden = true;
            gatilho.setAttribute('aria-expanded', 'false');
        }

        gatilho.onclick = function (e) {
            e.stopPropagation();
            if (lista.hidden) {
                abrir();
            } else {
                fechar();
            }
        };

        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) {
                fechar();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                fechar();
            }
        });

        wrap.append(gatilho, lista);

        if (topo) {
            const voltar = topo.querySelector('.back');
            if (voltar) {
                topo.insertBefore(wrap, voltar);
            } else {
                topo.appendChild(wrap);
            }
        } else {
            document.body.appendChild(wrap);
        }

        aplicar(lerTema());
    }

    if (window.matchMedia) {
        const sistema = window.matchMedia(MEDIA_DARK);
        const atualizarSeSistema = function () {
            if (lerTema() === 'sistema') {
                aplicar('sistema');
            }
        };

        if (sistema.addEventListener) {
            sistema.addEventListener('change', atualizarSeSistema);
        } else if (sistema.addListener) {
            sistema.addListener(atualizarSeSistema);
        }
    }

    window.DevTema = {
        aplicar: salvar,
        atual: lerTema
    };

    aplicar(lerTema());

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', montarMenu);
    } else {
        montarMenu();
    }
})();
