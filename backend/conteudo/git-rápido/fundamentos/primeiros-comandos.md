---
titulo: Iniciando um Repositório e Fazendo Commits
ordem: 3
duracao: 15
---

# Seu primeiro repositório local

Vamos criar um pequeno projeto chamado `caderno-dev`. Abra um terminal dentro da pasta e inicialize o repositório com a branch `main`:

```bash
git init -b main
git status
```

Se a versão instalada não aceitar `-b`, use esta alternativa antes do primeiro commit:

```bash
git init
git branch -M main
```

Crie `README.md` com uma frase sobre o projeto. O arquivo ainda está apenas no diretório de trabalho. Prepare-o e registre o primeiro commit:

```bash
git add README.md
git status
git commit -m "Adiciona apresentação do projeto"
git status
```

`git init` cria a estrutura interna do repositório. `git add` prepara o conteúdo que entrará no próximo commit. `git commit` registra a versão preparada no histórico local. O segundo `git status` deve indicar que a árvore de trabalho está limpa.

Use `git add README.md` quando quiser escolher o arquivo. `git add .` prepara todas as alterações sob a pasta atual; antes de usá-lo, confira `git status` para não incluir arquivos que não deveriam ser registrados.

### Exercício

Adicione uma seção “Como usar” ao README e faça um segundo commit. Use `git status` antes de preparar e depois do commit. O histórico deve ter dois registros separados, cada um representando uma etapa compreensível.

**Fontes oficiais:** [git-init](https://git-scm.com/docs/git-init) · [git-add](https://git-scm.com/docs/git-add) · [git-commit](https://git-scm.com/docs/git-commit)
