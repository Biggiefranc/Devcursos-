const AppError = require("../errors/AppError");

function validarIdPositivo(valor, nome = "Identificador") {
    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError(400, "ID_INVALIDO", `${nome} inválido.`);
    }

    return id;
}

module.exports = { validarIdPositivo };
