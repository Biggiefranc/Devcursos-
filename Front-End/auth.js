import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import { requisicaoAPI, encerrarSessao } from "./services/api";

// Protege somente páginas que carregam este script.
onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
        window.location.replace("login.html");
        return;
    }

    try {
        await requisicaoAPI("/me");
    } catch (erro) {
        console.error("Não foi possível validar o perfil:", erro);
        if (erro.status === 401) {
            await encerrarSessao();
            window.location.replace("login.html");
        } else if (erro.status === 404) {
            window.location.replace("login.html");
        }
    }
});
