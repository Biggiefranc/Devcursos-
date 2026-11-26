require("../../config/loadEnv");

const {
    initializeApp,
    cert,
    getApps
} = require("firebase-admin/app");

const { getAuth } = require("firebase-admin/auth");

function getFirebaseAuthMode() {
    if (process.env.NODE_ENV !== "development" && process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        throw new Error("FIREBASE_AUTH_EMULATOR_HOST só pode ser usado em NODE_ENV=development.");
    }

    const configured = String(process.env.FIREBASE_AUTH_MODE || "strict")
        .trim()
        .toLowerCase();

    if (!new Set(["strict", "bypass"]).has(configured)) {
        throw new Error("FIREBASE_AUTH_MODE deve ser 'strict' ou 'bypass'.");
    }

    if (configured === "bypass") {
        const hostsLocais = new Set(["localhost", "127.0.0.1", "::1"]);
        const bancoLocal = hostsLocais.has(
            String(process.env.DB_HOST || "").trim().toLowerCase()
        );

        if (process.env.NODE_ENV !== "development" || !bancoLocal) {
            throw new Error(
                "O bypass do Firebase exige NODE_ENV=development e DB_HOST local."
            );
        }
    }

    return configured;
}

function getFirebaseCredential() {
    const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!encoded || !projectId) {
        throw new Error(
            "Configure FIREBASE_SERVICE_ACCOUNT_BASE64 e FIREBASE_PROJECT_ID."
        );
    }

    let serviceAccount;

    try {
        serviceAccount = JSON.parse(
            Buffer.from(encoded, "base64").toString("utf8")
        );
    } catch {
        throw new Error("A credencial Firebase Base64 não contém um JSON válido.");
    }

    if (
        serviceAccount.type !== "service_account" ||
        !serviceAccount.client_email ||
        !serviceAccount.private_key ||
        serviceAccount.project_id !== projectId
    ) {
        throw new Error(
            "A credencial Firebase está incompleta ou pertence a outro projeto."
        );
    }

    return cert(serviceAccount);
}

const firebaseAuthMode = getFirebaseAuthMode();

if (firebaseAuthMode === "bypass") {
    console.warn(
        "AVISO: autenticação Firebase em bypass. Permitido somente para desenvolvimento local."
    );
}

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp(
        firebaseAuthMode === "strict"
            ? {
                credential: getFirebaseCredential(),
                projectId: process.env.FIREBASE_PROJECT_ID
            }
            : {
                projectId: process.env.FIREBASE_PROJECT_ID || "devcursos-b3589"
            }
    );

const firebaseAuth = getAuth(firebaseApp);

module.exports = {
    firebaseApp,
    firebaseAuth,
    getFirebaseAuthMode,
    shouldBypassFirebaseAuth: firebaseAuthMode === "bypass"
};
