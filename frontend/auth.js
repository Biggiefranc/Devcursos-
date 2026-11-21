import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase-config";

// Mantém o token da sessão disponível para a API sem redirecionar a tela atual.
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    localStorage.removeItem("devcursos_token");
    localStorage.removeItem("devcursos_user");
    return;
  }

  try {
    const token = await user.getIdToken();
    const profile = {
      uid: user.uid,
      nome: user.displayName || user.email?.split("@")[0] || "Aluno",
      email: user.email,
      foto: user.photoURL || null,
    };
    localStorage.setItem("devcursos_token", token);
    localStorage.setItem("devcursos_user", JSON.stringify(profile));
  } catch (error) {
    console.warn("Não foi possível atualizar a sessão local.", error);
  }
});
