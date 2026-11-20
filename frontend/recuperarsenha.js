import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase/firebase-config";

const form = document.getElementById("recoveryForm");
const emailInput = document.getElementById("email");
const status = document.getElementById("recoveryStatus");
const button = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.classList.remove("show");
  status.textContent = "";
  button.disabled = true;

  try {
    await sendPasswordResetEmail(auth, emailInput.value.trim());
    status.textContent =
      "Se existir uma conta associada a esse e-mail, você receberá um link para redefinir sua senha.";
  } catch (error) {
    console.error("Falha ao solicitar redefinição de senha:", error);
    const mensagens = {
      "auth/invalid-email": "Informe um endereço de e-mail válido.",
      "auth/too-many-requests":
        "Muitas solicitações. Aguarde um pouco e tente novamente.",
      "auth/network-request-failed":
        "Falha de conexão. Verifique sua internet e tente novamente.",
    };
    status.textContent =
      mensagens[error.code] ||
      "Não foi possível solicitar a redefinição agora. Tente novamente mais tarde.";
  } finally {
    status.classList.add("show");
    button.disabled = false;
  }
});
