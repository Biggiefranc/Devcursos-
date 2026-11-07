/* ==========================================================
   api.js  |  ÚNICO arquivo que o Robert (back end) precisa mexer
   ----------------------------------------------------------
   As telas só chamam estas funções. Hoje elas SIMULAM tudo
   (DEMO = true) só para dar pra ver o visual funcionando.

   Regras para cada função:
   - deu certo  -> retorna normalmente (pode ser async)
   - deu errado -> throw com uma mensagem em português
                   ou deixa passar o erro do Firebase (o telas.js
                   já traduz os códigos mais comuns, ex.: auth/email-already-in-use)
   - se o e-mail ainda não foi confirmado, no login faça:
       throw Object.assign(new Error('Confirme seu e-mail antes de entrar.'),
                           { code: 'email-nao-verificado' });
     (assim a tela mostra o botão "Reenviar e-mail de confirmação")
   ========================================================== */

(function () {
    const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
    const erro = (msg, code) => Object.assign(new Error(msg), { code });

    window.DevCursosAPI = {

        /* Troque para false quando ligar o back end real */
        DEMO: true,

        /* Para onde ir depois do login. Ex.: 'index.html'
           Com null a tela só mostra "Login OK" (modo demonstração). */
        PAGINA_APOS_LOGIN: null,

        /* ---------- LOGIN ----------
           Firebase: signInWithEmailAndPassword(auth, email, senha)
           e depois conferir user.emailVerified (se false -> deslogar e
           lançar o erro 'email-nao-verificado'). */
        async login(email, senha) {
            await esperar(900);
            // --- simulação (apague quando ligar o real) ---
            if (email.includes('naoverificado')) throw erro('Confirme seu e-mail antes de entrar.', 'email-nao-verificado');
            if (senha === 'errada') throw erro('E-mail ou senha incorretos.');
        },

        /* ---------- CADASTRO ----------
           Firebase: createUserWithEmailAndPassword(auth, email, senha)
                     updateProfile(user, { displayName: nome })
                     sendEmailVerification(user, { url: '.../verificado.html' }) */
        async cadastrar({ nome, email, senha }) {
            await esperar(1100);
            // --- simulação ---
            if (email.includes('existe')) throw erro('Este e-mail já está cadastrado.', 'auth/email-already-in-use');
        },

        /* ---------- REENVIAR E-MAIL DE CONFIRMAÇÃO ----------
           Firebase: sendEmailVerification(auth.currentUser) */
        async reenviarConfirmacao(email) {
            await esperar(800);
        },

        /* ---------- CONFIRMAR CONTA (chamada na verificado.html) ----------
           O link do e-mail abre verificado.html?mode=verifyEmail&oobCode=XXXX
           Firebase: applyActionCode(auth, oobCode)
           No demo: abra verificado.html?oobCode=erro para ver a tela de erro. */
        async confirmarConta(oobCode) {
            await esperar(600);
            // --- simulação ---
            if (oobCode === 'erro') throw erro('Link inválido ou expirado.', 'auth/invalid-action-code');
        },

        /* ---------- ESQUECI MINHA SENHA ----------
           Firebase: sendPasswordResetEmail(auth, email) */
        async esqueciSenha(email) {
            await esperar(900);
        }
    };
})();