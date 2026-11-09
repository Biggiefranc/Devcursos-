import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import { requisicaoAPI, encerrarSessao } from "./services/api";

// Protege somente páginas que carregam este script.
onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
        localStorage.removeItem("devcursos_token");
        localStorage.removeItem("devcursos_user");
        window.location.replace("login.html");
        return;
    }

    const token = await usuario.getIdToken();
    localStorage.setItem("devcursos_token", token);

    try {
        await requisicaoAPI("/me", { headers: { Authorization: `Bearer ${token}` } });
    } catch (erro) {
        console.error("Não foi possível validar o perfil:", erro);
    //    if (erro.status === 401) {
    //        await encerrarSessao();
    //        window.location.replace("login.html");
    //    } else if (erro.status === 404) {
    //        window.location.replace("login.html");
    //    }
    }
});
