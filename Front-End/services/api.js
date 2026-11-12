import {
    browserLocalPersistence,
    browserSessionPersistence,
    setPersistence,
    signOut
} from "firebase/auth";
import { auth } from "../firebase/firebase-config";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
export async function configurarPersistencia(lembrar = true) {
    await setPersistence(
        auth,
        lembrar ? browserLocalPersistence : browserSessionPersistence
    );
}

export async function tokenAtual() {
    const usuario = auth.currentUser;
    if (usuario) return usuario.getIdToken();

    const tokenSalvo = localStorage.getItem("devcursos_token");
    return tokenSalvo || null;
}

export async function requisicaoAPI(caminho, opcoes = {}) {
    const token = await tokenAtual();
    const headers = new Headers(opcoes.headers || {});

    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (opcoes.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const resposta = await fetch(`${API_URL}${caminho}`, {
        ...opcoes,
        headers
    });

    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
        const erro = new Error(dados.mensagem || `Erro HTTP ${resposta.status}`);
        erro.status = resposta.status;
        throw erro;
    }
    return dados;
}

export async function sincronizarPerfil(nome) {
    return requisicaoAPI("/usuarios/sincronizar", {
        method: "POST",
        body: JSON.stringify({ nome })
    });
}

export async function encerrarSessao() {
    await signOut(auth);
}
