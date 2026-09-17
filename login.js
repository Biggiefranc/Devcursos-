/* =========================
   ELEMENTOS
========================= */

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const passwordButton =
    document.getElementById("passwordButton");

const loginError =
    document.getElementById("loginError");

const rememberInput =
    document.getElementById("remember");


/* =========================
   MOSTRAR / OCULTAR SENHA
========================= */

passwordButton.addEventListener("click", () => {

    const senhaOculta =
        passwordInput.type === "password";


    if (senhaOculta) {

        passwordInput.type = "text";

        passwordButton.innerHTML =
            '<i data-lucide="eye-off"></i>';

    } else {

        passwordInput.type = "password";

        passwordButton.innerHTML =
            '<i data-lucide="eye"></i>';

    }


    lucide.createIcons();

});


/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        emailInput.value.trim();

    const senha =
        passwordInput.value;


    loginError.textContent = "";


    try {

        const resposta = await fetch(
            "http://localhost:3000/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            }
        );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            loginError.textContent =
                dados.mensagem;

            return;
        }


        /*
            LOGIN REALIZADO
        */

        localStorage.setItem(
            "devcursosLoggedIn",
            "true"
        );


        /*
            Salva os dados básicos
            do usuário
        */

        localStorage.setItem(
            "devcursosUsuario",
            JSON.stringify(dados.usuario)
        );


        /*
            Lembrar o e-mail
        */

        if (rememberInput.checked) {

            localStorage.setItem(
                "devcursosEmail",
                email
            );

        } else {

            localStorage.removeItem(
                "devcursosEmail"
            );

        }


        /*
            Vai para o dashboard
        */

        window.location.href =
            "index.html";


    } catch (erro) {

        console.error(erro);

        loginError.textContent =
            "Não foi possível conectar ao servidor.";

    }

});


/* =========================
   RECUPERAR E-MAIL
========================= */

const emailSalvo =
    localStorage.getItem("devcursosEmail");


if (emailSalvo) {

    emailInput.value = emailSalvo;

    rememberInput.checked = true;

}