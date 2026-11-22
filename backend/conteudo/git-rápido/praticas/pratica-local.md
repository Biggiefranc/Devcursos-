---
titulo: "Prática guiada: organize um repositório local"
descricao: Faça commits pequenos, leia o diff e integre uma branch local.
ordem: 1
duracao: 30
video_url: null
material_url: null
---

# Entrega: histórico local revisável

Use um projeto seu ou crie uma pasta de exercício chamada `caderno-de-estudos`. O resultado deve mostrar que você sabe acompanhar mudanças sem depender da interface do GitHub.

## Etapas

1. Crie `README.md` com objetivo e instruções de uso; crie `.gitignore` apropriado.
2. Inicialize com `git init -b main` e confira `git status`.
3. Prepare apenas os arquivos de apresentação e registre um commit.
4. Edite o README; confira `git diff`, prepare a mudança e faça outro commit com mensagem específica.
5. Crie `docs/estrutura`, adicione uma pequena seção “Estrutura do projeto” e registre o commit nessa branch.
6. Volte para `main`, integre com `git merge docs/estrutura` e confira o histórico.

## Evidências

- README com objetivo e instruções reproduzíveis.
- `.gitignore` sem credenciais reais.
- Pelo menos três commits com mensagens compreensíveis.
- `git status` limpo ao final.
- Histórico mostrando a branch e a integração.

Se aparecer um conflito inesperado, pare e leia `git status` antes de executar outro comando. Explique em suas próprias palavras o que foi preparado em cada commit.
