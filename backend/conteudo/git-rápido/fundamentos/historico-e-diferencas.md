---
titulo: Leia diferenças e histórico antes de mudar
descricao: Use status, diff e log para entender o estado do repositório.
ordem: 5
duracao: 12
video_url: null
material_url: null
---

# Investigue o estado antes de agir

Antes de preparar, descartar ou integrar mudanças, descubra o que existe. Estes comandos respondem perguntas diferentes:

```bash
git status
git diff
git diff --staged
git log --oneline --decorate --graph
git show HEAD
```

- `status` resume arquivos novos, modificados, preparados e a branch atual.
- `diff` compara o diretório de trabalho com o conteúdo preparado.
- `diff --staged` compara o conteúdo preparado com o commit atual.
- `log` apresenta commits anteriores.
- `show HEAD` detalha o commit apontado por `HEAD`.

Uma saída vazia de `git diff` não significa que o projeto não tenha alterações: elas podem já estar preparadas. Por isso, confira `status` e, quando necessário, ambos os diffs.

### Prática de leitura

Faça uma pequena alteração no README, rode `status` e `diff`, prepare o arquivo, rode `status` e `diff --staged`. Sem criar outro commit, explique em uma frase o que cada comando mostrou.

**Fontes oficiais:** [git-status](https://git-scm.com/docs/git-status) · [git-diff](https://git-scm.com/docs/git-diff) · [git-log](https://git-scm.com/docs/git-log)
