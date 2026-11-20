const test = require("node:test");
const assert = require("node:assert/strict");
const { validarIdPositivo } = require("./ids");

test("aceita somente identificadores inteiros positivos seguros", () => {
    assert.equal(validarIdPositivo("42", "ID do curso"), 42);
    assert.throws(() => validarIdPositivo("0"), { statusCode: 400 });
    assert.throws(() => validarIdPositivo("1.5"), { statusCode: 400 });
    assert.throws(() => validarIdPositivo(String(Number.MAX_SAFE_INTEGER + 1)), { statusCode: 400 });
});
