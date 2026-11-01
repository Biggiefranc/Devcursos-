
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

// Sincroniza a identidade Firebase com o perfil armazenado no MySQL.

async function sincronizarPerfil({ firebaseUser, nome }) {
    const identidade = validarIdentidade(firebaseUser);

    // 1. Verifica se o usuário já está vinculado.
    const usuarioVinculado =
        await usersRepository.buscarPorFirebaseUid(identidade.uid);

    if (usuarioVinculado) {
        return {
            usuario: usuarioVinculado,
            acao: "ja_vinculado"
        };
    }

    // 2. Procura uma conta antiga pelo e-mail.
    const usuarioAntigo =
        await usersRepository.buscarPorEmail(identidade.email);

    // Só executa a lógica de vinculação se encontrar uma conta antiga.
    if (usuarioAntigo) {

        // Verifica se a conta já foi vinculada a este mesmo UID.
        if (usuarioAntigo.firebase_uid === identidade.uid) {
            return {
                usuario: usuarioAntigo,
                acao: "ja_vinculado"
            };
        }

        // Impede que uma conta seja associada a outro UID.
        if (usuarioAntigo.firebase_uid) {
            throw criarErro(
                409,
                "CONTA_JA_VINCULADA",
                "Este e-mail já está associado a outra conta Firebase."
            );
        }

        // Exige e-mail confirmado para vincular uma conta antiga.
        if (!identidade.emailVerified) {
            throw criarErro(
                403,
                "EMAIL_NAO_VERIFICADO",
                "Verifique seu e-mail antes de vincular sua conta antiga."
            );
        }

        try {
            const vinculado =
                await usersRepository.vincularFirebaseUid(
                    usuarioAntigo.id,
                    identidade.uid
                );

            // Outra requisição pode ter feito o vínculo primeiro.
            if (!vinculado) {
                const usuarioAtual =
                    await usersRepository.buscarPorFirebaseUid(
                        identidade.uid
                    );

                if (usuarioAtual) {
                    return {
                        usuario: usuarioAtual,
                        acao: "ja_vinculado"
                    };
                }

                throw criarErro(
                    409,
                    "CONFLITO_DE_VINCULO",
                    "Não foi possível vincular esta conta ao perfil existente."
                );
            }

            const usuarioAtual =
                await usersRepository.buscarPorFirebaseUid(
                    identidade.uid
                );

            if (!usuarioAtual) {
                throw new Error(
                    "O perfil foi vinculado, mas não pôde ser recuperado."
                );
            }

            return {
                usuario: usuarioAtual,
                acao: "vinculado"
            };

        } catch (erro) {
            if (erro.code === "ER_DUP_ENTRY") {
                throw criarErro(
                    409,
                    "CONFLITO_DE_VINCULO",
                    "Esta conta Firebase já está vinculada a outro perfil."
                );
            }

            throw erro;
        }
    }

    // 3. Não existe perfil anterior: cria um novo.
    const nomeNormalizado = validarNome(nome);

    try {
        const novoUsuario = await usersRepository.criar({
            firebaseUid: identidade.uid,
            nome: nomeNormalizado,
            email: identidade.email
        });

        if (!novoUsuario) {
            throw new Error(
                "Não foi possível recuperar o perfil criado."
            );
        }

        return {
            usuario: novoUsuario,
            acao: "criado"
        };

    } catch (erro) {

        // Trata duas requisições simultâneas tentando criar a mesma conta.
        if (erro.code === "ER_DUP_ENTRY") {
            const usuarioAtual =
                await usersRepository.buscarPorFirebaseUid(
                    identidade.uid
                );

            if (usuarioAtual) {
                return {
                    usuario: usuarioAtual,
                    acao: "ja_vinculado"
                };
            }

            throw criarErro(
                409,
                "CONTA_JA_EXISTENTE",
                "Já existe um perfil cadastrado com este e-mail."
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
