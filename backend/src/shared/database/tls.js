const fs = require("node:fs");
const { isIP } = require("node:net");

function opcoesTls(host, caminhoCa) {
    // O mysql2 usa um hostname DNS para verificar explicitamente a identidade TLS.
    if (isIP(host)) {
        throw new Error("Para usar TLS no MySQL, configure DB_HOST com o nome DNS do certificado.");
    }

    return {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
        verifyIdentity: true,
        ...(caminhoCa ? { ca: fs.readFileSync(caminhoCa, "utf8") } : {})
    };
}

module.exports = { opcoesTls };
