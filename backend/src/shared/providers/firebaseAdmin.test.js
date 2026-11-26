const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { getFirebaseAuthMode } = require("./firebaseAdmin");

test("usa autenticação estrita por padrão", () => {
    const original = process.env.FIREBASE_AUTH_MODE;
    delete process.env.FIREBASE_AUTH_MODE;
    try {
        assert.equal(getFirebaseAuthMode(), "strict");
    } finally {
        if (original === undefined) delete process.env.FIREBASE_AUTH_MODE;
        else process.env.FIREBASE_AUTH_MODE = original;
    }
});

test("permite bypass somente com NODE_ENV=development explícito", () => {
    const originalMode = process.env.FIREBASE_AUTH_MODE;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDbHost = process.env.DB_HOST;
    process.env.FIREBASE_AUTH_MODE = "bypass";
    process.env.NODE_ENV = "development";
    process.env.DB_HOST = "localhost";
    try {
        assert.equal(getFirebaseAuthMode(), "bypass");
    } finally {
        if (originalMode === undefined) delete process.env.FIREBASE_AUTH_MODE;
        else process.env.FIREBASE_AUTH_MODE = originalMode;
        if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = originalNodeEnv;
        if (originalDbHost === undefined) delete process.env.DB_HOST;
        else process.env.DB_HOST = originalDbHost;
    }
});

test("recusa bypass fora do desenvolvimento local", () => {
    const originalMode = process.env.FIREBASE_AUTH_MODE;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDbHost = process.env.DB_HOST;
    process.env.FIREBASE_AUTH_MODE = "bypass";
    process.env.NODE_ENV = "production";
    process.env.DB_HOST = "localhost";
    try {
        assert.throws(() => getFirebaseAuthMode(), /NODE_ENV=development/);
    } finally {
        if (originalMode === undefined) delete process.env.FIREBASE_AUTH_MODE;
        else process.env.FIREBASE_AUTH_MODE = originalMode;
        if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = originalNodeEnv;
        if (originalDbHost === undefined) delete process.env.DB_HOST;
        else process.env.DB_HOST = originalDbHost;
    }
});

test("recusa bypass de desenvolvimento apontado para banco remoto", () => {
    const originalMode = process.env.FIREBASE_AUTH_MODE;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDbHost = process.env.DB_HOST;
    process.env.FIREBASE_AUTH_MODE = "bypass";
    process.env.NODE_ENV = "development";
    process.env.DB_HOST = "database.example.com";
    try {
        assert.throws(() => getFirebaseAuthMode(), /DB_HOST local/);
    } finally {
        if (originalMode === undefined) delete process.env.FIREBASE_AUTH_MODE;
        else process.env.FIREBASE_AUTH_MODE = originalMode;
        if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = originalNodeEnv;
        if (originalDbHost === undefined) delete process.env.DB_HOST;
        else process.env.DB_HOST = originalDbHost;
    }
});

function iniciarComEmulador(ambiente) {
    return spawnSync(process.execPath, ["-e", "require('./firebaseAdmin')"], {
        cwd: __dirname,
        env: {
            ...process.env,
            NODE_ENV: ambiente,
            FIREBASE_AUTH_MODE: "strict",
            FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
        },
        encoding: "utf8",
    });
}

test("recusa iniciar em produção com o emulador de Auth configurado", () => {
    const resultado = iniciarComEmulador("production");
    assert.equal(resultado.status, 1);
    assert.match(resultado.stderr, /FIREBASE_AUTH_EMULATOR_HOST/);
});

test("permite iniciar com o emulador de Auth em desenvolvimento", () => {
    const resultado = iniciarComEmulador("development");
    assert.equal(resultado.status, 0, resultado.stderr);
});
