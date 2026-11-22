---
titulo: Desfaça alterações com cuidado
descricao: Diferencie restaurar arquivos, retirar conteúdo do staging e reverter commits.
ordem: 7
duracao: 15
video_url: null
material_url: null
---

# Escolha a correção que corresponde ao problema

Antes de desfazer qualquer coisa, leia `git status` e `git diff`. O comando errado pode descartar trabalho útil.

- `git restore caminho` substitui a versão não preparada do arquivo pela versão preparada. Isso descarta as edições não preparadas daquele caminho.
- `git restore --staged caminho` retira o arquivo da área de preparação, mantendo as alterações no diretório de trabalho.
- `git revert <commit>` cria um novo commit que desfaz as mudanças de um commit anterior. É uma opção adequada para corrigir histórico já compartilhado.
- `git reset` move a referência atual para outro commit; o efeito depende das opções. `git reset --hard` pode descartar trabalho e não faz parte desta prática.

Uma decisão segura começa por inspecionar o arquivo e o histórico, fazer uma cópia do trabalho que queira preservar e escolher a operação menos destrutiva. Não cole comandos de recuperação sem entender qual estado eles alteram.

### Cenários

1. Você preparou o arquivo errado, mas quer manter suas edições: retire-o do staging.
2. Uma mudança commitada precisa ser desfeita num branch compartilhado: crie um commit de reversão.
3. Há uma edição local que você não quer perder: não use `restore` sobre ela antes de salvá-la.

**Fontes oficiais:** [git-restore](https://git-scm.com/docs/git-restore) · [git-revert](https://git-scm.com/docs/git-revert) · [git-reset](https://git-scm.com/docs/git-reset)
