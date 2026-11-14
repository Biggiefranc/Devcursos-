const test = require("node:test");
const assert = require("node:assert/strict");
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
    process.env.FIREBASE_AUTH_MODE = "bypass";
    process.env.NODE_ENV = "development";
    try {
        assert.equal(getFirebaseAuthMode(), "bypass");
    } finally {
        if (originalMode === undefined) delete process.env.FIREBASE_AUTH_MODE;
        else process.env.FIREBASE_AUTH_MODE = originalMode;
        if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = originalNodeEnv;
    }
});

test("recusa bypass fora do desenvolvimento local", () => {
    const originalMode = process.env.FIREBASE_AUTH_MODE;
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.FIREBASE_AUTH_MODE = "bypass";
    process.env.NODE_ENV = "production";
    try {
        assert.throws(() => getFirebaseAuthMode(), /NODE_ENV=development/);
    } finally {
        if (originalMode === undefined) delete process.env.FIREBASE_AUTH_MODE;
        else process.env.FIREBASE_AUTH_MODE = originalMode;
        if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = originalNodeEnv;
    }
});
