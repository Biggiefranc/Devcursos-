---
titulo: Conectando e Enviando para o GitHub
ordem: 1
duracao: 15
video_url: null
material_url: null
---

# Publique um repositório local

Git controla o histórico na sua máquina. Para compartilhar esse histórico, conecte o repositório local a um repositório remoto no GitHub. `origin` é apenas o nome convencional dado ao primeiro remoto; você pode usar outro nome.

Se você já tem um repositório local com commits, crie no GitHub um repositório vazio, sem inicializar README, licença ou `.gitignore`. Copie a URL de clone exibida pelo GitHub e execute dentro da pasta local:

```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git remote -v
git push -u origin main
```

Troque a URL de exemplo pela URL real do seu repositório. `git push` envia commits; `-u` configura a relação de acompanhamento entre a branch local e a remota para facilitar próximos `push` e `pull`.

Se o repositório no GitHub já tiver um README ou outros commits, prefira cloná-lo e trabalhar nessa cópia, como veremos adiante. Criar dois históricos independentes e tentar juntá-los sem entender a divergência pode gerar uma integração desnecessariamente difícil.

### Confira

Abra o repositório no GitHub e confirme que os arquivos e commits esperados estão lá. No terminal, rode `git status -sb` e `git remote -v`. Não publique arquivos de configuração, credenciais, dados pessoais ou projetos de outra pessoa.

**Fontes oficiais:** [git-remote](https://git-scm.com/docs/git-remote) · [git-push](https://git-scm.com/docs/git-push) · [Git e linha de comando no GitHub](https://docs.github.com/en/get-started/using-git/about-git)
