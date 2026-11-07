/* ==========================================================
   telas.js  |  comportamento visual das 3 telas
   (login, cadastro, verificado). Não mexe em back end:
   tudo que precisa do servidor chama window.DevCursosAPI (api.js)
   ========================================================== */
(function () {
    'use strict';

    const API = window.DevCursosAPI;
    const $ = (sel, raiz) => (raiz || document).querySelector(sel);
    const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

    /* ---------- tradução dos erros do Firebase ---------- */
    const ERROS = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente entrar na sua conta.',
        'auth/invalid-email': 'Digite um e-mail válido.',
        'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.',
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/wrong-password': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'E-mail ou senha incorretos.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
        'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
        'auth/expired-action-code': 'Este link expirou.',
        'auth/invalid-action-code': 'Link inválido ou já utilizado.'
    };
    function textoErro(err) {
        return ERROS[err && err.code] || (err && err.message) || 'Algo deu errado. Tente novamente.';
    }

    /* ---------- helpers ---------- */
    // mostra uma tela (.view) com slide. dir = 1 (vem da direita) ou -1 (vem da esquerda)
    function mostrar(view, dir) {
        dir = dir || 1;
        const grupo = view.parentElement;
        grupo.querySelectorAll('.view.is-active').forEach(function (v) {
            v.style.setProperty('--dx', (-40 * dir) + 'px');
            v.classList.remove('is-active');
        });
        view.style.transition = 'none';
        view.style.setProperty('--dx', (40 * dir) + 'px');
        void view.offsetWidth;                 // força o navegador a aplicar
        view.style.transition = '';
        view.classList.add('is-active');
        const foco = view.querySelector('input:not([type=hidden])');
        if (foco) foco.focus({ preventScroll: true });
    }

    function mensagem(el, texto, tipo) {
        el.textContent = texto || '';
        el.className = 'msg' + (texto && tipo ? ' ' + tipo : '');
    }

    function carregando(botao, ligado) {
        botao.classList.toggle('is-loading', ligado);
        botao.disabled = ligado;
    }

    /* ---------- olhinho da senha (todas as páginas) ---------- */
    document.querySelectorAll('.toggle-senha').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const input = btn.parentElement.querySelector('input');
            const vaiMostrar = input.type === 'password';
            input.type = vaiMostrar ? 'text' : 'password';
            btn.classList.toggle('ativo', vaiMostrar);
            btn.setAttribute('aria-label', vaiMostrar ? 'Esconder senha' : 'Mostrar senha');
        });
    });

    /* ==========================================================
       LOGIN
       ========================================================== */
    function iniciarLogin() {
        const viewLogin = $('#viewLogin');
        const viewRec = $('#viewRecuperar');

        const form = $('#loginForm');
        const msg = $('#loginMsg');
        const btn = $('#loginBtn');
        const reenviar = $('#reenviarLogin');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            mensagem(msg, '');
            reenviar.hidden = true;
            carregando(btn, true);
            try {
                await API.login($('#email').value.trim(), $('#senha').value);
                if (API.PAGINA_APOS_LOGIN) {
                    mensagem(msg, 'Tudo certo! Entrando...', 'ok');
                    window.location.href = API.PAGINA_APOS_LOGIN;
                } else {
                    mensagem(msg, 'Login OK (modo demonstração, sem redirecionar).', 'ok');
                }
            } catch (err) {
                mensagem(msg, textoErro(err), 'erro');
                if (err.code === 'email-nao-verificado') reenviar.hidden = false;
            } finally {
                carregando(btn, false);
            }
        });

        reenviar.addEventListener('click', async function () {
            try {
                await API.reenviarConfirmacao($('#email').value.trim());
                mensagem(msg, 'Enviamos um novo e-mail de confirmação. Confira sua caixa de entrada.', 'ok');
                reenviar.hidden = true;
            } catch (err) {
                mensagem(msg, textoErro(err), 'erro');
            }
        });

        /* --- esqueci minha senha (troca de tela) --- */
        $('#abrirRecuperar').addEventListener('click', function (e) {
            e.preventDefault();
            $('#recEmail').value = $('#email').value;
            mostrar(viewRec, 1);
        });
        $('#voltarLogin').addEventListener('click', function () { mostrar(viewLogin, -1); });

        const recForm = $('#recForm');
        const recMsg = $('#recMsg');
        const recBtn = $('#recBtn');
        recForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            mensagem(recMsg, '');
            carregando(recBtn, true);
            try {
                await API.esqueciSenha($('#recEmail').value.trim());
                mensagem(recMsg, 'Se existir uma conta com esse e-mail, enviamos o link para criar uma nova senha.', 'ok');
            } catch (err) {
                mensagem(recMsg, textoErro(err), 'erro');
            } finally {
                carregando(recBtn, false);
            }
        });
    }

    /* ==========================================================
       CADASTRO  (formulário -> confirme seu e-mail)
       ========================================================== */
    function iniciarCadastro() {
        const viewForm = $('#viewForm');
        const viewConfirma = $('#viewConfirma');
        const passos = document.querySelectorAll('.step');

        function marcarPasso(n) {          // n = 1 (dados) ou 2 (confirmar)
            passos.forEach(function (p, i) {
                p.classList.toggle('feito', i + 1 < n);
                p.classList.toggle('ativo', i + 1 === n);
                p.querySelector('b').textContent = (i + 1 < n) ? '✓' : String(i + 1);
            });
        }

        const form = $('#cadastroForm');
        const msg = $('#cadastroMensagem');
        const btn = $('#cadastroBtn');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            mensagem(msg, '');
            carregando(btn, true);
            const email = $('#email').value.trim();
            try {
                await API.cadastrar({
                    nome: $('#nome').value.trim(),
                    email: email,
                    senha: $('#senha').value
                });
                $('#emailAlvo').textContent = email;
                marcarPasso(2);
                mostrar(viewConfirma, 1);
                iniciarContagem(60);
            } catch (err) {
                mensagem(msg, textoErro(err), 'erro');
            } finally {
                carregando(btn, false);
            }
        });

        /* --- reenviar e-mail com contagem regressiva --- */
        const btnReenviar = $('#reenviarBtn');
        const msgConfirma = $('#confirmaMsg');
        let timer = null;

        function iniciarContagem(segundos) {
            clearInterval(timer);
            let restante = segundos;
            btnReenviar.disabled = true;
            btnReenviar.textContent = 'Reenviar em ' + restante + 's';
            timer = setInterval(function () {
                restante -= 1;
                if (restante <= 0) {
                    clearInterval(timer);
                    btnReenviar.disabled = false;
                    btnReenviar.textContent = 'Reenviar e-mail';
                } else {
                    btnReenviar.textContent = 'Reenviar em ' + restante + 's';
                }
            }, 1000);
        }

        btnReenviar.addEventListener('click', async function () {
            btnReenviar.disabled = true;
            mensagem(msgConfirma, '');
            try {
                await API.reenviarConfirmacao($('#email').value.trim());
                mensagem(msgConfirma, 'E-mail reenviado! Confira sua caixa de entrada.', 'ok');
                iniciarContagem(60);
            } catch (err) {
                mensagem(msgConfirma, textoErro(err), 'erro');
                btnReenviar.disabled = false;
            }
        });

        $('#outroEmail').addEventListener('click', function () {
            clearInterval(timer);
            mensagem(msgConfirma, '');
            marcarPasso(1);
            mostrar(viewForm, -1);
        });
    }

    /* ==========================================================
       VERIFICADO  (página que abre pelo link do e-mail)
       carregando -> sucesso ou erro
       ========================================================== */
    async function iniciarVerificado() {
        const codigo = new URLSearchParams(window.location.search).get('oobCode');

        let ok = true;
        const resultado = await Promise.allSettled([
            (!codigo && !API.DEMO)
                ? Promise.reject(new Error('Link inválido.'))
                : API.confirmarConta(codigo),
            esperar(1400)                  // mostra o "carregando" por pelo menos 1,4s
        ]);
        if (resultado[0].status === 'rejected') {
            ok = false;
            $('#erroTexto').textContent = textoErro(resultado[0].reason);
        }
        mostrar(ok ? $('#viewOk') : $('#viewErro'), 1);
    }

    /* ---------- liga a página certa ---------- */
    const pagina = document.body.dataset.page;
    if (pagina === 'login') iniciarLogin();
    if (pagina === 'cadastro') iniciarCadastro();
    if (pagina === 'verificado') iniciarVerificado();
})();