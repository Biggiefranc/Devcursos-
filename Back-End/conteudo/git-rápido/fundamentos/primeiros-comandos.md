---
titulo: Iniciando um Repositório e Fazendo Commits
ordem: 2
duracao: 8
---

# Seus Primeiros Comandos no Terminal

Para começar a rastrear uma pasta com o Git, abra o terminal dentro do projeto e digite:

```bash
git init
```

## Salvando alterações (Commit)
O fluxo básico do dia a dia envolve preparar os arquivos e salvar um ponto na história:

```bash
git add .
git commit -m "feat: adiciona estrutura inicial do projeto"
```

* **`git add .`**: Coloca todos os arquivos modificados na área de preparação (*Staging*).
* **`git commit`**: Grava definitivamente aquela versão no histórico local.
