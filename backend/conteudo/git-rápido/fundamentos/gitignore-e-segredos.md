---
titulo: Ignore arquivos locais e proteja segredos
descricao: Crie regras de .gitignore e reconheça o que elas não removem do histórico.
ordem: 6
duracao: 14
video_url: null
material_url: null
---

# O que não deve entrar no repositório

Dependências instaladas, arquivos de build, logs, configurações locais e credenciais geralmente não pertencem ao histórico. Um arquivo `.gitignore` na raiz pode conter regras como:

```gitignore
node_modules/
dist/
*.log
.env
!.env.example
```

Adapte as regras à tecnologia do projeto. Um `.env.example` deve conter nomes de variáveis e valores de exemplo sem credenciais reais. Nunca coloque tokens, senhas, chaves privadas ou dados pessoais no Git.

O `.gitignore` evita que arquivos ainda não rastreados sejam oferecidos para inclusão. Ele **não** deixa de rastrear um arquivo que já foi commitado. Primeiro confira `git status`. Se um arquivo local já rastreado precisar deixar de ser acompanhado, `git rm --cached caminho/do/arquivo` o remove do próximo snapshot sem apagar sua cópia local; isso não apaga versões anteriores do histórico.

Se uma credencial foi enviada a um remoto, remover o arquivo num commit posterior não basta: revogue ou troque a credencial imediatamente e procure orientação sobre limpeza do histórico.

### Prática

Crie um `.env` fictício contendo `API_KEY=exemplo-nao-real` e uma regra `.env`. Confirme que o Git não oferece o arquivo para commit. Não use nem compartilhe uma chave verdadeira durante o exercício.

**Fontes oficiais:** [Git básico no GitHub](https://docs.github.com/en/get-started/git-basics) · [gitignore](https://git-scm.com/docs/gitignore)
