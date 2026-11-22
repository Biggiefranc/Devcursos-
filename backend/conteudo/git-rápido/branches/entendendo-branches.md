---
titulo: "Branches: linhas independentes de trabalho"
descricao: Entenda branches e a referência HEAD antes de criar uma linha de trabalho.
ordem: 1
duracao: 10
video_url: null
material_url: null
---

# Uma branch é uma linha de trabalho

Uma branch permite desenvolver uma mudança sem misturá-la imediatamente à linha principal. No Git, o nome da branch aponta para um commit; novos commits avançam essa referência. `HEAD` indica onde o trabalho atual está conectado.

Branches são leves e locais. Criar `feature/tela-inicial` não copia manualmente a pasta do projeto e não envia nada ao GitHub. A branch só passa a existir no remoto depois de ser enviada.

```bash
git branch
git log --oneline --decorate --graph --all
```

Uma branch não é uma cópia de segurança nem um ambiente isolado do sistema: arquivos não commitados continuam no diretório de trabalho e podem acompanhar você ao trocar de branch, desde que a troca não entre em conflito.

### Prática de leitura

Observe os nomes e o commit atual com `git branch` e `git log --oneline --decorate --graph --all`. Identifique qual branch está marcada com `*` e qual commit ela aponta.

**Fonte oficial:** [Branches no Pro Git](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)
