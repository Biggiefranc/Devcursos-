---
titulo: Crie e alterne entre branches
descricao: Use git switch para iniciar e alternar linhas de trabalho.
ordem: 2
duracao: 12
video_url: null
material_url: null
---

# Isole uma mudança pequena

Comece com uma árvore de trabalho limpa e atualize a branch principal. Depois crie uma branch para uma tarefa:

```bash
git status
git switch main
git switch -c docs/atualiza-readme
```

`git switch -c` cria a branch e muda para ela. O nome `docs/atualiza-readme` comunica o tipo de trabalho. Nomes claros facilitam conversas e revisão.

Edite o README, confira a diferença, prepare e faça um commit. Ao voltar para `main`, o commit não estará na linha principal até que seja integrado:

```bash
git add README.md
git commit -m "Documenta como iniciar o projeto"
git switch main
```

Se o Git impedir a troca, leia a mensagem: alterações não commitadas podem ser sobrescritas ou colidir com a outra branch. Salve ou registre o trabalho antes de tentar novamente.

### Exercício

Crie uma branch chamada `docs/objetivo`, altere uma frase do README e faça um commit nela. Volte para `main` e confirme com `git log --oneline --all` que o commit existe, embora ainda não esteja integrado à branch principal.

**Fontes oficiais:** [git-switch](https://git-scm.com/docs/git-switch) · [Branches no Git](https://git-scm.com/docs/git-branch)
