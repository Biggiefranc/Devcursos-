const usersRepository = require("./users.repository");
const AppError = require("../../shared/errors/AppError");

// Valida e normaliza a identidade fornecida pelo middleware Firebase.
function validarIdentidade(firebaseUser) {
    if (
        !firebaseUser ||
        typeof firebaseUser.uid !== "string" ||
        !firebaseUser.uid.trim() ||
        firebaseUser.uid.length > 128
    ) {
        throw new AppError(
            401,
            "IDENTIDADE_INVALIDA",
            "Não foi possível identificar o usuário autenticado."
        );
    }

    if (
        typeof firebaseUser.email !== "string" ||
        !firebaseUser.email.trim() ||
        firebaseUser.email.length > 150
    ) {
        throw new AppError(
            400,
            "EMAIL_INVALIDO",
            "A conta Firebase precisa possuir um e-mail válido."
        );
    }

    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email.trim().toLowerCase(),
        emailVerified: firebaseUser.emailVerified === true
    };
}

// Valida o nome informado para criação de um perfil novo.
function validarNome(nome) {
    if (typeof nome !== "string") {
        throw new AppError(
            400,
            "NOME_OBRIGATORIO",
            "Informe seu nome para criar o perfil."
        );
    }

    const nomeNormalizado = nome.trim();

    if (!nomeNormalizado || nomeNormalizado.length > 100) {
        throw new AppError(
            400,
            "NOME_INVALIDO",
            "O nome deve possuir entre 1 e 100 caracteres."
        );
    }

    return nomeNormalizado;
}

// Cria um perfil novo ou recupera o perfil já associado ao UID Firebase.
async function sincronizarPerfil({ firebaseUser, nome }) {
    const identidade = validarIdentidade(firebaseUser);

    if (!identidade.emailVerified) {
        throw new AppError(
            403,
            "EMAIL_NAO_VERIFICADO",
            "Verifique seu e-mail antes de concluir o cadastro."
        );
    }

    const usuarioVinculado =
        await usersRepository.buscarPorFirebaseUid(identidade.uid);

    if (usuarioVinculado) {
        try {
            const usuarioAtualizado = await usersRepository.atualizarEmailPorFirebaseUid(
                identidade.uid,
                identidade.email
            );
            return {
                usuario: usuarioAtualizado || usuarioVinculado,
                acao: "ja_vinculado"
            };
        } catch (erro) {
            if (erro.code === "ER_DUP_ENTRY") {
                throw new AppError(
                    409,
                    "EMAIL_JA_CADASTRADO",
                    "Este e-mail já está vinculado a outro perfil."
                );
            }
            throw erro;
        }
    }

    const nomeNormalizado = validarNome(nome);

    try {
        const novoUsuario = await usersRepository.criar({
            firebaseUid: identidade.uid,
            nome: nomeNormalizado,
            email: identidade.email
        });

        if (!novoUsuario) {
            throw new Error("O perfil foi criado, mas não pôde ser recuperado.");
        }

        return { usuario: novoUsuario, acao: "criado" };
    } catch (erro) {
        // Trata requisições simultâneas: o UID único impede perfis duplicados.
        if (erro.code === "ER_DUP_ENTRY") {
            const usuarioAtual =
                await usersRepository.buscarPorFirebaseUid(identidade.uid);

            if (usuarioAtual) {
                return { usuario: usuarioAtual, acao: "ja_vinculado" };
            }

            throw new AppError(
                409,
                "EMAIL_JA_CADASTRADO",
                "Este e-mail já possui um perfil no DevCursos+."
            );
        }
        throw erro;
    }
}

// Recupera o perfil MySQL do usuário autenticado.
async function buscarPerfil(firebaseUid) {
    const usuario = await usersRepository.buscarPorFirebaseUid(
        firebaseUid
    );

    if (!usuario) {
        throw new AppError(
            404,
            "PERFIL_NAO_ENCONTRADO",
            "Seu perfil ainda não foi sincronizado com o DevCursos+."
        );
    }

    return usuario;
}

module.exports = {
    sincronizarPerfil,
    buscarPerfil
};
