---
titulo: Clone um projeto que já existe
descricao: Crie uma cópia local de um repositório remoto com seu histórico.
ordem: 3
duracao: 12
video_url: null
material_url: null
---

# Comece a partir de um remoto existente

Quando um repositório já existe no GitHub, `git clone` cria uma cópia local com os arquivos, commits e referências remotas:

```bash
git clone https://github.com/USUARIO/REPOSITORIO.git
cd REPOSITORIO
git status -sb
git remote -v
```

Substitua a URL de exemplo pela URL exibida no repositório. Por padrão, o remoto clonado costuma ser chamado `origin`. A branch padrão e a forma de autenticação dependem do repositório e da configuração do GitHub.

Clonar não significa que suas mudanças já foram enviadas. Depois de editar, você ainda precisa revisar, preparar, commitar e fazer push. Se você só tem acesso de leitura, poderá clonar e estudar o projeto; para enviar mudanças diretamente, precisará de permissão ou de um fork.

### Prática

Clone um repositório público de exemplo ou o seu próprio. Localize a raiz com `git rev-parse --show-toplevel`, confira `git remote -v` e identifique a branch atual. Não faça alterações no projeto de terceiros sem autorização.

**Fontes oficiais:** [git-clone](https://git-scm.com/docs/git-clone) · [Sobre Git](https://docs.github.com/en/get-started/using-git/about-git)
