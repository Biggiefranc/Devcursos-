
const { firebaseAuth } = require("../providers/firebaseAdmin");

// Erros que indicam que o token ou a conta não são válidos.
const ERROS_DE_AUTENTICACAO = new Set([
    "auth/argument-error",
    "auth/invalid-id-token",
    "auth/id-token-expired",
    "auth/id-token-revoked",
    "auth/user-disabled",
    "auth/user-not-found"
]);

async function autenticar(req, res, next) {
    const cabecalho = req.headers.authorization || "";

    // Espera o formato: Authorization: Bearer <token>
    const correspondencia = /^Bearer\s+(\S+)$/i.exec(cabecalho);

    if (!correspondencia) {
        return res.status(401).json({
            mensagem: "Autenticação necessária."
        });
    }

    const token = correspondencia[1];

    try {
        // Verifica assinatura, validade, expiração e revogação.
        const usuarioFirebase = await firebaseAuth.verifyIdToken(
            token,
            true
        );

        // Disponibiliza a identidade verificada para as próximas etapas.
        req.firebaseUser = {
            uid: usuarioFirebase.uid,
            email: usuarioFirebase.email || null,
            emailVerified: usuarioFirebase.email_verified === true
        };

        return next();

    } catch (erro) {
        // Token inválido, expirado ou conta desabilitada.
        if (ERROS_DE_AUTENTICACAO.has(erro.code)) {
            return res.status(401).json({
                mensagem: "Sessão inválida ou expirada. Faça login novamente."
            });
        }

        // Falhas inesperadas no serviço de autenticação.
        console.error(
            "Erro ao verificar autenticação Firebase:",
            erro.code || erro.message
        );

        return res.status(503).json({
            mensagem: "Não foi possível validar sua autenticação agora."
        });
    }
}

module.exports = autenticar;
