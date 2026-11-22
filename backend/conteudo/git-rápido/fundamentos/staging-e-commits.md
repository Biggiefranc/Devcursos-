---
titulo: Área de preparação e commits que contam uma história
descricao: Separe mudanças, revise o conteúdo preparado e escreva mensagens úteis.
ordem: 4
duracao: 14
video_url: null
material_url: null
---

# Escolha o que entra no próximo commit

O Git separa o trabalho em três lugares: arquivos no **diretório de trabalho**, mudanças selecionadas na **área de preparação** (*staging area*) e commits no **histórico**. Essa separação permite revisar exatamente o que será registrado.

```bash
git status
git diff
git add README.md
git diff --staged
git commit -m "Explica como executar o projeto"
```

`git diff` mostra mudanças ainda não preparadas. `git diff --staged` mostra o conteúdo que irá para o commit. Se editar o arquivo depois de executar `git add`, a nova edição não entra automaticamente no conteúdo já preparado; adicione o arquivo outra vez.

Commits pequenos e focados ajudam a revisar, explicar e localizar mudanças. Escreva a mensagem como uma descrição do resultado, evitando mensagens vagas como `update`, `mudanças` ou `final`.

### Prática

No `README.md`, altere o título e acrescente uma instrução de uso. Prepare apenas o README, confira `git diff --staged` e registre o commit. Depois crie uma alteração em outro arquivo e confirme que ela ficou fora daquele commit.

**Critério de conclusão:** você consegue apontar qual mudança está preparada e qual ainda está apenas no diretório de trabalho.

**Fontes oficiais:** [git-add](https://git-scm.com/docs/git-add) · [git-diff](https://git-scm.com/docs/git-diff) · [git-commit](https://git-scm.com/docs/git-commit)
