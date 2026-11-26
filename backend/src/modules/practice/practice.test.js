const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createServer } = require("node:http");
const test = require("node:test");

async function iniciar(servidor, teste) {
    servidor.listen(0, "127.0.0.1");
    await once(servidor, "listening");
    teste.after(() => new Promise((resolve) => servidor.close(resolve)));
    return `http://127.0.0.1:${servidor.address().port}`;
}

test("somente casos isolados corrigidos pela API podem aprovar uma prática", async (t) => {
    const jobs = [];
    const tentativas = [];
    let relogio = Date.now();
    let aceitaExecucao = false;
    let falharNoCaso = null;
    let saidaDeCaso = (caso) => JSON.stringify(caso.argumentos[0] * 2);
    t.mock.method(Date, "now", () => relogio);

    const piston = createServer(async (req, res) => {
        let corpo = "";
        for await (const parte of req) corpo += parte;
        const job = JSON.parse(corpo);
        jobs.push(job);
        const ehCaso = Boolean(job.stdin);
        const caso = ehCaso ? JSON.parse(job.stdin) : null;
        if (!aceitaExecucao || caso?.argumentos?.[0] === falharNoCaso) {
            res.writeHead(403).end();
            return;
        }
        const stdout = ehCaso ? saidaDeCaso(caso) : "devcursos-executor-ok\n";
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ run: { stdout, stderr: "", code: 0, signal: null } }));
    });
    const executor = await iniciar(piston, t);

    Object.assign(process.env, {
        NODE_ENV: "development",
        DB_HOST: "localhost",
        DB_PORT: "1",
        DB_USER: "fixture",
        DB_NAME: "fixture",
        DB_PASSWORD: "",
        DB_SSL: "false",
        DB_SSL_CA: "",
        FIREBASE_AUTH_MODE: "bypass",
        PISTON_API_URL: `${executor}/api/v2`,
        PISTON_API_TOKEN: "",
    });
    const progress = require("../progress/progress.service");
    const users = require("../users/users.repository");
    const practice = require("./practice.repository");
    const app = require("../../app");
    const { pool } = require("../../shared/database/database");
    t.after(() => pool.end());
    t.mock.method(progress, "buscarAulaLiberada", async () => ({ id: 1, linguagem: "python", exercicio: { id: 2 } }));
    t.mock.method(users, "buscarPorFirebaseUid", async () => ({ id: 3 }));
    t.mock.method(practice, "buscarExercicioPorAula", async () => ({
        id: 2,
        avaliador_json: {
            tipo: "funcao",
            nome_funcao: "dobrar",
            casos: [{ argumentos: [3], resultado_esperado: 6 }, { argumentos: [4], resultado_esperado: 8 }],
        },
    }));
    t.mock.method(practice, "registrarTentativa", async (tentativa) => tentativas.push(tentativa));

    const api = await iniciar(createServer(app), t);
    const codigo = "def dobrar(valor): return valor * 2";
    const enviar = (dados) => fetch(`${api}/aulas/1/exercicio/tentativas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercicioId: 2, codigo, ...dados }),
    });

    let resposta = await enviar({ resultados: [{ valor: 6 }, { valor: 8 }] });
    assert.equal(resposta.status, 400);
    assert.equal((await resposta.json()).codigo, "RESULTADOS_DO_CLIENTE");
    assert.equal(jobs.length, 0);

    let aula = await fetch(`${api}/aulas/1`).then((res) => res.json());
    assert.equal(aula.modoExecucao, "navegador");
    assert.equal(aula.correcaoDisponivel, false);
    resposta = await enviar();
    assert.equal(resposta.status, 503);
    assert.equal(tentativas.length, 0);
    assert.equal(jobs.length, 1);

    relogio += 16000;
    aceitaExecucao = true;
    aula = await fetch(`${api}/aulas/1`).then((res) => res.json());
    assert.equal(aula.modoExecucao, "remoto");
    assert.equal(aula.correcaoDisponivel, true);
    resposta = await enviar();
    assert.equal(resposta.status, 201);
    assert.equal((await resposta.json()).aprovado, true);
    assert.deepEqual(tentativas.map(({ aprovado }) => aprovado), [true]);
    assert.deepEqual(jobs.slice(2).map(({ stdin }) => JSON.parse(stdin)), [
        { tipo: "funcao", nomeFuncao: "dobrar", argumentos: [3] },
        { tipo: "funcao", nomeFuncao: "dobrar", argumentos: [4] },
    ]);
    for (const job of jobs.slice(2)) {
        assert.deepEqual(job.files[1], { name: "submissao.py", content: codigo });
        assert.ok(job.run_memory_limit > 0);
        assert.doesNotMatch(job.files[0].content, /resultado_esperado|aprovado/);
    }

    relogio += 1001;
    saidaDeCaso = () => JSON.stringify([{ valor: 6 }, { valor: 8 }]);
    resposta = await enviar();
    assert.equal(resposta.status, 201);
    assert.equal((await resposta.json()).aprovado, false);
    assert.deepEqual(tentativas.map(({ aprovado }) => aprovado), [true, false]);

    relogio += 1001;
    falharNoCaso = 4;
    resposta = await enviar();
    assert.equal(resposta.status, 503);
    assert.equal(tentativas.length, 2);
});
