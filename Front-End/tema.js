
/* =====================================================
   Dev Cursos+ — tema compartilhado (menu + persistência)
   Tema padrão: ESCURO
   ===================================================== */

(function () {
    'use strict';

    const CHAVE = 'devcursos-tema';

    const OPCOES = [
        { valor: 'sistema', rotulo: 'Padrão do sistema' },
        { valor: 'claro', rotulo: 'Claro' },
        { valor: 'escuro', rotulo: 'Escuro' }
    ];

    // Recupera o tema salvo. Se não existir, usa escuro.
    function lerTema() {
        try {
            return localStorage.getItem(CHAVE) || 'escuro';
        } catch (e) {
            return 'escuro';
        }
    }

    // Aplica o tema na página.
    function aplicar(tema) {
        document.documentElement.dataset.tema = tema;

        document.querySelectorAll('.tema-lista button').forEach(function (botao) {
            botao.setAttribute(
                'aria-checked',
                String(botao.dataset.t === tema)
            );
        });
    }

    // Salva a preferência do usuário.
    function salvar(tema) {
        try {
            localStorage.setItem(CHAVE, tema);
        } catch (e) {}

        aplicar(tema);
    }

    // Cria o menu de seleção de tema.
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
            <span class="icone" aria-hidden="true">◐</span>
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

        // Insere o menu antes do botão voltar, se existir.
        const voltar = topo.querySelector('.back');

        if (voltar) {
            topo.insertBefore(wrap, voltar);
        } else {
            topo.appendChild(wrap);
        }

        aplicar(lerTema());
    }

    // Permite trocar o tema através de outros arquivos JavaScript.
    window.DevTema = {
        aplicar: salvar,
        atual: lerTema
    };

    // Aplica o tema imediatamente.
    aplicar(lerTema());

    // Monta o menu quando o HTML estiver pronto.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', montarMenu);
    } else {
        montarMenu();
    }

})();
