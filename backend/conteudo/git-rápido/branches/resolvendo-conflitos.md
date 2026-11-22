---
titulo: Resolva um conflito de merge
descricao: Leia marcadores de conflito, escolha o conteúdo final e conclua a integração.
ordem: 4
duracao: 20
video_url: null
material_url: null
---

# Um conflito é uma decisão a tomar

Um conflito ocorre quando o Git não consegue combinar automaticamente mudanças concorrentes. O Git marca o arquivo para que você escolha o resultado. Os marcadores se parecem com:

```text
<<<<<<< HEAD
conteúdo da branch atual
=======
conteúdo da branch que está sendo integrada
>>>>>>> nome-da-branch
```

Esses marcadores são instruções de edição, não conteúdo que deve permanecer no arquivo. Leia as duas versões, converse com quem fez a mudança quando necessário e escreva o resultado correto. Depois procure e remova todos os marcadores.

```bash
git status
# edite o arquivo e resolva os marcadores
git diff
git add caminho/do/arquivo
git commit
```

Em um merge, `git status` informa quais arquivos precisam de resolução. Preparar o arquivo resolvido registra ao Git que a escolha foi feita; o commit conclui a integração.

### Prática segura

Em um repositório descartável, crie uma branch, edite a mesma linha do README de duas maneiras diferentes em branches distintas e tente integrá-las. Preserve um resultado final que faça sentido e confirme que `git diff --check` e `git status` não mostram marcadores nem conflito pendente.

**Fonte oficial:** [Como resolver conflitos de merge](https://git-scm.com/docs/git-merge#_how_conflicts_are_presented)
