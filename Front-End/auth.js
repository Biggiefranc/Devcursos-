import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import { requisicaoAPI } from "./services/api";

const pagina = (location.pathname.split("/").pop() || "index.html").toLowerCase();
const precisaLogin = ["menudashbord.html", "visualizarcurso.html", "cursos.html"].includes(pagina);

function urlDestinoPadrao() {
    return "menudashbord.html";
}

function recuperarDestino() {
    const params = new URLSearchParams(location.search);
    const destino = params.get("redirect");
    if (!destino) return urlDestinoPadrao();

    try {
        const url = new URL(destino, location.origin);
        if (url.origin !== location.origin) return urlDestinoPadrao();
        return `${url.pathname}${url.search}` || urlDestinoPadrao();
    } catch {
        return urlDestinoPadrao();
    }
}

onAuthStateChanged(auth, async (usuario) => {
    const temSessaoLocal = Boolean(localStorage.getItem("devcursos_token"));

    if (!usuario) {
        if (precisaLogin) {
            localStorage.removeItem("devcursos_token");
            localStorage.removeItem("devcursos_user");
            const destino = encodeURIComponent(`${location.pathname}${location.search}`);
            window.location.replace(`login.html?redirect=${destino}`);
        }
        return;
    }

    const token = await usuario.getIdToken();
    localStorage.setItem("devcursos_token", token);
    try {
        const perfil = {
            uid: usuario.uid,
            nome: usuario.displayName || usuario.email?.split("@")[0] || "Aluno",
            email: usuario.email,
            foto: usuario.photoURL || null
        };
        localStorage.setItem("devcursos_user", JSON.stringify(perfil));
    } catch (erro) {
        console.warn("Não foi possível salvar o perfil local:", erro);
    }

    if (pagina === "login.html" || pagina === "cadastro.html") {
        window.location.replace(recuperarDestino());
        return;
    }

    try {
        await requisicaoAPI("/me", {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (erro) {
        console.error("Não foi possível validar o perfil:", erro);
    }
});
