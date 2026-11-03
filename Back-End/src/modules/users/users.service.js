
const usersRepository = require("./users.repository");

// Cria erros com informações que o controller poderá utilizar.
function criarErro(statusCode, codigo, mensagem) {
    const erro = new Error(mensagem);

    erro.statusCode = statusCode;
    erro.codigo = codigo;

    return erro;
}

// Valida e normaliza a identidade fornecida pelo middleware Firebase.
function validarIdentidade(firebaseUser) {
    if (
        !firebaseUser ||
        typeof firebaseUser.uid !== "string" ||
        !firebaseUser.uid.trim() ||
        firebaseUser.uid.length > 128
    ) {
        throw criarErro(
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
        throw criarErro(
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
        throw criarErro(
            400,
            "NOME_OBRIGATORIO",
            "Informe seu nome para criar o perfil."
        );
    }

    const nomeNormalizado = nome.trim();

    if (!nomeNormalizado || nomeNormalizado.length > 100) {
        throw criarErro(
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
        throw criarErro(
            403,
            "EMAIL_NAO_VERIFICADO",
            "Verifique seu e-mail antes de concluir o cadastro."
        );
    }

    const usuarioVinculado =
        await usersRepository.buscarPorFirebaseUid(identidade.uid);

    if (usuarioVinculado) {
        return { usuario: usuarioVinculado, acao: "ja_vinculado" };
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

            throw criarErro(
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
        throw criarErro(
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
