require("../../config/loadEnv");

const {
    initializeApp,
    applicationDefault,
    getApps
} = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

function getFirebaseAuthMode() {
    const configured = String(process.env.FIREBASE_AUTH_MODE || "strict")
        .trim()
        .toLowerCase();

    if (!new Set(["strict", "bypass"]).has(configured)) {
        throw new Error("FIREBASE_AUTH_MODE deve ser 'strict' ou 'bypass'.");
    }

    if (configured === "bypass") {
        const hostsLocais = new Set(["localhost", "127.0.0.1", "::1"]);
        const bancoLocal = hostsLocais.has(String(process.env.DB_HOST || "").trim().toLowerCase());

        if (process.env.NODE_ENV !== "development" || !bancoLocal) {
            throw new Error(
                "O bypass do Firebase exige NODE_ENV=development e DB_HOST local."
            );
        }
    }

    return configured;
}

const firebaseAuthMode = getFirebaseAuthMode();

if (firebaseAuthMode === "bypass") {
    console.warn(
        "AVISO: autenticação Firebase em bypass. Permitido somente para desenvolvimento local."
    );
}

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp(firebaseAuthMode === "strict"
        ? { credential: applicationDefault() }
        : { projectId: process.env.FIREBASE_PROJECT_ID || "devcursos-b3589" });

const firebaseAuth = getAuth(firebaseApp);

module.exports = {
    firebaseApp,
    firebaseAuth,
    getFirebaseAuthMode,
    shouldBypassFirebaseAuth: firebaseAuthMode === "bypass"
};
