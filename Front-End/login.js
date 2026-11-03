import { signInWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import { configurarPersistencia, sincronizarPerfil } from "./services/api";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const passwordButton = document.getElementById("passwordButton");
const loginError = document.getElementById("loginError");
const rememberInput = document.getElementById("remember");

passwordButton?.addEventListener("click", () => {
    const mostrar = passwordInput.type === "password";
    passwordInput.type = mostrar ? "text" : "password";
    passwordButton.innerHTML = mostrar
        ? '<i data-lucide="eye-off"></i>'
        : '<i data-lucide="eye"></i>';
    window.lucide?.createIcons();
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.textContent = "";

    try {
        await configurarPersistencia(rememberInput.checked);
        const credencial = await signInWithEmailAndPassword(
            auth,
            emailInput.value.trim(),
            passwordInput.value
        );

        if (!credencial.user.emailVerified) {
            await sendEmailVerification(credencial.user);
            await signOut(auth);
            throw new Error("Seu e-mail ainda não foi verificado. Enviamos um novo link de confirmação.");
        }

        await sincronizarPerfil(
            credencial.user.displayName ||
            credencial.user.email.split("@")[0]
        );

        if (rememberInput.checked) {
            localStorage.setItem("devcursosEmail", emailInput.value.trim());
        } else {
            localStorage.removeItem("devcursosEmail");
        }

        window.location.href = "menudashbord.html";
    } catch (erro) {
        console.error("Falha no login:", erro);
        loginError.textContent = mensagemFirebase(erro);
    }
});

function mensagemFirebase(erro) {
    const mensagens = {
        "auth/invalid-credential": "E-mail ou senha incorretos.",
        "auth/user-not-found": "Não existe uma conta com esse e-mail.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-email": "Informe um e-mail válido.",
        "auth/too-many-requests": "Muitas tentativas. Aguarde e tente novamente.",
        "auth/network-request-failed": "Falha de conexão. Verifique sua internet."
    };
    return mensagens[erro.code] || erro.message || "Não foi possível entrar.";
}

const emailSalvo = localStorage.getItem("devcursosEmail");
if (emailSalvo) {
    emailInput.value = emailSalvo;
    rememberInput.checked = true;
}
