(() => {
    const token = localStorage.getItem("devcursosToken");

    function encerrarSessao() {
        localStorage.removeItem("devcursosToken");
        localStorage.removeItem("devcursosLoggedIn");
        localStorage.removeItem("devcursosUsuario");

        const paginaLogin = window.location.pathname.endsWith("/login.html");

        if (!paginaLogin) {
            window.location.replace("login.html");
        }
    }

    if (!token) {
        encerrarSessao();
        return;
    }

    fetch("http://localhost:3000/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(async resposta => {
            if (!resposta.ok) {
                encerrarSessao();
                return;
            }

            const dados = await resposta.json();

            if (dados.usuario) {
                localStorage.setItem(
                    "devcursosUsuario",
                    JSON.stringify(dados.usuario)
                );
            }
        })
        .catch(() => {
            console.error(
                "Não foi possível validar a sessão. Verifique se o backend está ativo."
            );
        });
})();
