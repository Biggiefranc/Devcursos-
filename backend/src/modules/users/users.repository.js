
const { pool } = require("../../shared/database/database");

// Campos que podem ser disponibilizados para outras camadas.
// Não incluímos a senha nem seu hash.
const CAMPOS_USUARIO = `
    id,
    firebase_uid,
    nome,
    email,
    data_criacao
`;

// A primeira comparação usa o índice. A segunda exige igualdade byte a byte.
const FILTRO_UID = "firebase_uid = ? AND CAST(firebase_uid AS BINARY) = CAST(? AS BINARY)";

// Busca um usuário pelo UID do Firebase.
async function buscarPorFirebaseUid(firebaseUid) {
    const sql = `
        SELECT ${CAMPOS_USUARIO}
        FROM usuarios
        WHERE ${FILTRO_UID}
        LIMIT 1
    `;

    const [usuarios] = await pool.execute(sql, [firebaseUid, firebaseUid]);

    return usuarios[0] || null;
}

// Busca um usuário pelo identificador interno do MySQL.
async function buscarPorId(usuarioId) {
    const sql = `
        SELECT ${CAMPOS_USUARIO}
        FROM usuarios
        WHERE id = ?
        LIMIT 1
    `;

    const [usuarios] = await pool.execute(sql, [usuarioId]);

    return usuarios[0] || null;
}

// Cria um novo perfil vinculado ao Firebase.
async function criar({ firebaseUid, nome, email }) {
    const sql = `
        INSERT INTO usuarios (firebase_uid, nome, email)
        VALUES (?, ?, ?)
    `;

    const [resultado] = await pool.execute(sql, [
        firebaseUid,
        nome,
        email
    ]);

    // Retorna o usuário recém-criado.
    return buscarPorId(resultado.insertId);
}

async function atualizarEmailPorFirebaseUid(firebaseUid, email) {
    await pool.execute(
        `UPDATE usuarios SET email = ? WHERE ${FILTRO_UID}`,
        [email, firebaseUid, firebaseUid]
    );
    return buscarPorFirebaseUid(firebaseUid);
}

module.exports = {
    buscarPorFirebaseUid,
    buscarPorId,
    criar,
    atualizarEmailPorFirebaseUid
};
