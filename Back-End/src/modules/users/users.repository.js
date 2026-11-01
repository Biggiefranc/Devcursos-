
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

// Busca um usuário pelo UID do Firebase.
async function buscarPorFirebaseUid(firebaseUid) {
    const sql = `
        SELECT ${CAMPOS_USUARIO}
        FROM usuarios
        WHERE firebase_uid = ?
        LIMIT 1
    `;

    const [usuarios] = await pool.execute(sql, [firebaseUid]);

    return usuarios[0] || null;
}

// Busca um usuário pelo endereço de e-mail.
async function buscarPorEmail(email) {
    const sql = `
        SELECT ${CAMPOS_USUARIO}
        FROM usuarios
        WHERE email = ?
        LIMIT 1
    `;

    const [usuarios] = await pool.execute(sql, [email]);

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

// Vincula uma conta antiga do MySQL ao Firebase.
async function vincularFirebaseUid(usuarioId, firebaseUid) {
    const sql = `
        UPDATE usuarios
        SET firebase_uid = ?
        WHERE id = ?
          AND firebase_uid IS NULL
    `;

    const [resultado] = await pool.execute(sql, [
        firebaseUid,
        usuarioId
    ]);

    return resultado.affectedRows === 1;
}

module.exports = {
    buscarPorFirebaseUid,
    buscarPorEmail,
    buscarPorId,
    criar,
    vincularFirebaseUid
};
