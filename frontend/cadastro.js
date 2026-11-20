import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signOut } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import { configurarPersistencia } from "./services/api";

const cadastroForm = document.getElementById("cadastroForm");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const cadastroMensagem = document.getElementById("cadastroMensagem");

cadastroForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    cadastroMensagem.style.color = "";
    cadastroMensagem.textContent = "";

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!nome || nome.length > 100) {
        cadastroMensagem.textContent = "Informe um nome de até 100 caracteres.";
        return;
    }

    try {
        await configurarPersistencia(false);
        const credencial = await createUserWithEmailAndPassword(auth, email, senha);
        await updateProfile(credencial.user, { displayName: nome });
        await sendEmailVerification(credencial.user);
        await signOut(auth);

        cadastroMensagem.style.color = "green";
        cadastroMensagem.textContent = "Conta criada! Verifique seu e-mail antes de entrar.";
        cadastroForm.reset();
        setTimeout(() => window.location.href = "login.html", 2500);
    } catch (erro) {
        console.error("Falha no cadastro:", erro);
        cadastroMensagem.style.color = "red";
        const mensagens = {
            "auth/email-already-in-use": "Este e-mail já possui uma conta.",
            "auth/invalid-email": "Informe um e-mail válido.",
            "auth/weak-password": "A senha deve possuir pelo menos 6 caracteres.",
            "auth/network-request-failed": "Falha de conexão. Verifique sua internet."
        };
        cadastroMensagem.textContent = mensagens[erro.code] || erro.message || "Não foi possível criar a conta.";
    }
});
