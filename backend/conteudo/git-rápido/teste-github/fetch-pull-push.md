---
titulo: Sincronize o trabalho local e remoto
descricao: Distinga fetch, pull e push e confira o acompanhamento de branches.
ordem: 4
duracao: 15
video_url: null
material_url: null
---

# Traga e envie commits com contexto

O remoto guarda referências às branches publicadas. A branch local pode acompanhar uma referência remota, como `origin/main`.

```bash
git fetch origin
git branch -vv
git log --oneline --graph --decorate --all
```

`fetch` busca objetos e atualiza referências remotas locais, sem integrar automaticamente os commits à branch atual. `pull` busca as mudanças e integra a branch remota à atual; a integração pode usar merge ou rebase conforme opções e configuração. `push` envia commits locais para o remoto.

```bash
git pull
git push
```

Antes de sincronizar, confira `git status` e a branch atual. Ao receber uma mensagem de divergência, leia-a e descubra o que cada lado contém. Evite repetir comandos de integração sem revisar o estado e as opções usadas pelo projeto.

### Exercício

Em dois clones do mesmo repositório (ou com um colega), faça um commit e push em um clone. No outro, rode `git fetch`, investigue `origin/main` e só então integre a mudança com `git pull`.

**Fontes oficiais:** [git-fetch](https://git-scm.com/docs/git-fetch) · [git-pull](https://git-scm.com/docs/git-pull) · [git-push](https://git-scm.com/docs/git-push)
