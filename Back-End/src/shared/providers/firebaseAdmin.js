
const fs = require("node:fs");

const {
    initializeApp,
    applicationDefault,
    getApps
} = require("firebase-admin/app");

const { getAuth } = require("firebase-admin/auth");

// Carrega as configurações de ambiente
require("../../config/env");

function getFirebaseAuthMode() {
    const modoExplicit = (process.env.FIREBASE_AUTH_MODE || "").trim().toLowerCase();
    if (modoExplicit === "strict") return "strict";
    if (modoExplicit === "bypass") return "bypass";

    const caminhoCredencial = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!caminhoCredencial) return "bypass";

    try {
        fs.accessSync(caminhoCredencial, fs.constants.R_OK);
        return "strict";
    } catch {
        return "bypass";
    }
}

const firebaseAuthMode = getFirebaseAuthMode();

if (firebaseAuthMode === "bypass") {
    console.warn(
        "Firebase Admin em modo de desenvolvimento: a autenticação será bypassada porque não há credenciais válidas. Defina FIREBASE_AUTH_MODE=strict para produção."
    );
}

// Inicializa o Firebase Admin SDK somente quando há credenciais válidas.
const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp(
        firebaseAuthMode === "strict"
            ? { credential: applicationDefault() }
            : { projectId: process.env.FIREBASE_PROJECT_ID || "devcursos-b3589" }
    );

// Disponibiliza o serviço de autenticação
const firebaseAuth = getAuth(firebaseApp);

module.exports = {
    firebaseApp,
    firebaseAuth,
    getFirebaseAuthMode,
    shouldBypassFirebaseAuth: firebaseAuthMode === "bypass"
};
