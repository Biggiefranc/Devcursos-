---
titulo: Integre mudanças com merge
descricao: Combine uma branch de tarefa com a linha principal e confira o resultado.
ordem: 3
duracao: 15
video_url: null
material_url: null
---

# Traga uma mudança para a linha principal

Para integrar uma branch usando merge, primeiro mude para a branch que receberá a mudança. Neste exemplo, `main` recebe `docs/objetivo`:

```bash
git switch main
git merge docs/objetivo
git status
git log --oneline --graph --decorate
```

Se `main` não recebeu commits concorrentes, o Git pode avançar sua referência sem criar um commit de merge (*fast-forward*). Se as linhas avançaram separadamente, o Git pode criar um commit de merge para registrar a integração. As opções e políticas podem variar por projeto.

Depois do merge, confira o diff e o histórico. Remover uma branch local já integrada é opcional:

```bash
git branch -d docs/objetivo
```

Não use `-D` para forçar a exclusão de uma branch que o Git considera não integrada. Primeiro descubra o que ainda existe nela.

### Prática

Integre a branch `docs/objetivo` criada na aula anterior. Mostre a evidência com `git log --oneline --graph --decorate --all` e explique se o Git fez fast-forward ou criou um commit de merge.

**Fonte oficial:** [git-merge](https://git-scm.com/docs/git-merge)
