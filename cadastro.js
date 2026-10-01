const cadastroForm = document.getElementById("cadastroForm");

const nomeInput = document.getElementById("nome");

const emailInput = document.getElementById("email");

const senhaInput = document.getElementById("senha");

const cadastroMensagem =
    document.getElementById("cadastroMensagem");


cadastroForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const nome = nomeInput.value.trim();

    const email = emailInput.value.trim();

    const senha = senhaInput.value;


    cadastroMensagem.textContent = "";


    try {

        const resposta = await fetch(
            "http://localhost:3000/cadastro",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha
                })
            }
        );


        const dados = await resposta.json();


        if (!resposta.ok) {

            cadastroMensagem.textContent =
                dados.mensagem;

            return;
        }


        cadastroMensagem.style.color = "green";

        cadastroMensagem.textContent =
            "Conta criada com sucesso!";


        cadastroForm.reset();


        setTimeout(() => {

            window.location.href = "login.html";

        }, 1500);


    } catch (erro) {

        cadastroMensagem.style.color = "red";

        cadastroMensagem.textContent =
            "Não foi possível conectar ao servidor.";

        console.error(erro);
    }

});