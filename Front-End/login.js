import { signInWithPopup, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut } from "firebase/auth";

import { auth, googleProvider } from "./firebase/firebase-config";
import { configurarPersistencia, sincronizarPerfil } from "./services/api";

function destinoDepoisDoLogin() {
    const params = new URLSearchParams(window.location.search);
    const destino = params.get("redirect");

    if (!destino) return "menudashbord.html";

    try {
        const url = new URL(destino, window.location.origin);
        if (url.origin !== window.location.origin) return "menudashbord.html";
        return `${url.pathname}${url.search}` || "menudashbord.html";
    } catch {
        return "menudashbord.html";
    }
}

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("senha");
const loginError = document.getElementById("loginMsg");
const passwordButton = document.querySelector(".toggle-senha");

const recForm = document.getElementById("recForm");
const recEmail = document.getElementById("recEmail");
const recMsg = document.getElementById("recMsg");

function mostrarMensagem(elemento, texto, tipo = "") {
    elemento.textContent = texto;
    elemento.className = "msg" + (tipo ? " " + tipo : "");
}

// Mostrar/esconder senha
passwordButton?.addEventListener("click", () => {
    const mostrar = passwordInput.type === "password";

    passwordInput.type = mostrar ? "text" : "password";
    passwordButton.classList.toggle("ativo", mostrar);
    passwordButton.setAttribute(
        "aria-label",
        mostrar ? "Esconder senha" : "Mostrar senha"
    );
});

// Recuperação de senha
document.getElementById("abrirRecuperar").addEventListener("click", (event) => {
    event.preventDefault();

    recEmail.value = emailInput.value;

    document.getElementById("viewLogin").classList.remove("is-active");
    document.getElementById("viewRecuperar").classList.add("is-active");
});

document.getElementById("voltarLogin").addEventListener("click", () => {
    document.getElementById("viewRecuperar").classList.remove("is-active");
    document.getElementById("viewLogin").classList.add("is-active");
});

// Entrar
loginForm.addEventListener("submit", async (event) => {
    console.log("BOTÃO ENTRAR FOI ACIONADO");
    event.preventDefault();

    mostrarMensagem(loginError, "");

    try {
        await configurarPersistencia(true);

        const credencial = await signInWithEmailAndPassword(
            auth,
            emailInput.value.trim(),
            passwordInput.value
        );

        if (!credencial.user.emailVerified) {
            await sendEmailVerification(credencial.user);
            await signOut(auth);

            throw new Error(
                "Seu e-mail ainda não foi verificado. Enviamos um novo link."
            );
        }

        const nome = credencial.user.displayName ||
            credencial.user.email.split("@")[0];

        await sincronizarPerfil(nome);

        const token = await credencial.user.getIdToken();
        localStorage.setItem("devcursos_token", token);
        localStorage.setItem("devcursos_user", JSON.stringify({
            uid: credencial.user.uid,
            nome,
            email: credencial.user.email,
            foto: credencial.user.photoURL || null
        }));

        window.location.href = destinoDepoisDoLogin();

    } catch (erro) {
        console.error("Falha no login:", erro);

        const mensagens = {
            "auth/invalid-credential": "E-mail ou senha incorretos.",
            "auth/user-not-found": "Conta não encontrada.",
            "auth/wrong-password": "Senha incorreta.",
            "auth/invalid-email": "Informe um e-mail válido.",
            "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco.",
            "auth/network-request-failed": "Verifique sua conexão."
        };

        mostrarMensagem(
            loginError,
            mensagens[erro.code] || erro.message || "Não foi possível entrar.",
            "erro"
        );
    }
});

// Recuperar senha
recForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    mostrarMensagem(recMsg, "");

    try {
        await sendPasswordResetEmail(auth, recEmail.value.trim());

        mostrarMensagem(
            recMsg,
            "Se existir uma conta com esse e-mail, enviaremos um link de recuperação.",
            "ok"
        );

    } catch (erro) {
        console.error("Falha ao recuperar senha:", erro);

        const mensagens = {
            "auth/invalid-email": "Informe um e-mail válido.",
            "auth/user-not-found": "Não encontramos essa conta.",
            "auth/network-request-failed": "Verifique sua conexão."
        };

        mostrarMensagem(
            recMsg,
            mensagens[erro.code] || "Não foi possível enviar o link.",
            "erro"
        );
    }
});

// Nova função para o Google
// ...existing code...
async function autenticarComGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const idToken = await user.getIdToken();

    localStorage.setItem("devcursos_token", idToken);
    localStorage.setItem("devcursos_user", JSON.stringify({
      uid: user.uid,
      nome: user.displayName,
      email: user.email,
      foto: user.photoURL
    }));

    window.location.href = destinoDepoisDoLogin();
  } catch (error) {
    console.error("Erro no login com Google:", error.message);
    alert("Erro ao entrar com o Google: " + error.message);
  }
}

// Vincula ao botão do HTML
document.getElementById("btn-google")?.addEventListener("click", autenticarComGoogle);