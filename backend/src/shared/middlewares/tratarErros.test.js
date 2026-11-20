const test = require("node:test");
const assert = require("node:assert/strict");
const AppError = require("../errors/AppError");
const tratarErros = require("./tratarErros");

function executarMiddleware(erro) {
    const resposta = {
        statusCode: null,
        corpo: null,
        headersSent: false,
        status(codigo) {
            this.statusCode = codigo;
            return this;
        },
        json(corpo) {
            this.corpo = corpo;
            return this;
        }
    };

    tratarErros(erro, { method: "POST", path: "/teste" }, resposta, () => {});
    return resposta;
}

test("mantém mensagens seguras de erros operacionais", () => {
    const resposta = executarMiddleware(new AppError(409, "CONFLITO", "Registro duplicado."));
    assert.equal(resposta.statusCode, 409);
    assert.deepEqual(resposta.corpo, {
        mensagem: "Registro duplicado.",
        codigo: "CONFLITO"
    });
});

test("converte falhas do parser JSON em 400", () => {
    const resposta = executarMiddleware({ type: "entity.parse.failed", message: "JSON inválido" });
    assert.equal(resposta.statusCode, 400);
    assert.equal(resposta.corpo.codigo, "JSON_INVALIDO");
});

test("não envia detalhes de erros internos ao cliente", () => {
    const erroOriginal = console.error;
    console.error = () => {};
    try {
        const resposta = executarMiddleware(new Error("SQL secreto"));
        assert.equal(resposta.statusCode, 500);
        assert.deepEqual(resposta.corpo, {
            mensagem: "Erro interno do servidor.",
            codigo: "ERRO_INTERNO"
        });
    } finally {
        console.error = erroOriginal;
    }
});
