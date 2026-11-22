---
titulo: O que é Git e por que usar?
ordem: 1
duracao: 12
---

# Git guarda a história do projeto

Imagine que você está preparando um trabalho e salva cópias como `trabalho-final`, `trabalho-final-agora-vai` e `trabalho-final-2`. Fica difícil saber o que mudou e qual versão está certa. Um sistema de controle de versão registra mudanças com contexto, autoria e ordem.

O **Git** é um sistema distribuído de controle de versões. Cada clone contém os arquivos e o histórico do repositório. Você pode registrar mudanças e consultar esse histórico sem estar conectado à internet. Um registro criado com `git commit` é chamado de commit.

O **GitHub** é um serviço que hospeda repositórios Git e acrescenta recursos de colaboração, como issues, revisão de código e pull requests. Git e GitHub trabalham juntos, mas são coisas diferentes: o Git funciona localmente; o GitHub recebe e compartilha cópias remotas.

## Um modelo mental útil

- **Repositório:** arquivos do projeto e o histórico controlado pelo Git.
- **Commit:** um conjunto registrado de mudanças, com uma mensagem que explica a intenção.
- **Branch:** uma linha de trabalho independente que pode ser integrada depois.
- **Remoto:** outro repositório, geralmente hospedado no GitHub.

O Git não substitui cópias de segurança: o histórico local pode estar no mesmo disco do projeto. Também não resolve automaticamente toda colaboração; ele registra e ajuda a combinar mudanças.

## Prática curta

Escolha uma pasta de estudo. Sem instalar nada ainda, escreva em um arquivo de texto três mudanças que você gostaria de acompanhar. Para cada uma, anote como uma mensagem de commit que explique o resultado, por exemplo: `Adiciona instruções para executar o projeto`.

**Confira:** uma boa mensagem descreve uma mudança concreta. “Alterações” não dá contexto; “Documenta como iniciar o projeto” dá.

**Fontes oficiais:** [Sobre Git](https://docs.github.com/en/get-started/using-git/about-git) · [Tutorial introdutório do Git](https://git-scm.com/docs/gittutorial)
