
const {
    initializeApp,
    applicationDefault,
    getApps
} = require("firebase-admin/app");

const { getAuth } = require("firebase-admin/auth");

// Carrega as configurações de ambiente
require("../../config/env");

// Inicializa o Firebase Admin SDK
const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault()
    });

// Disponibiliza o serviço de autenticação
const firebaseAuth = getAuth(firebaseApp);

module.exports = {
    firebaseApp,
    firebaseAuth
};
