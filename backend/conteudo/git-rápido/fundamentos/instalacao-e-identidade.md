---
titulo: Instalação e configuração inicial
descricao: Verifique a instalação e configure a identidade registrada nos novos commits.
ordem: 2
duracao: 12
video_url: null
material_url: null
---

# Prepare o Git para trabalhar

Instale o Git pelo gerenciador de pacotes do seu sistema ou pelo instalador disponível no site oficial. Depois, abra um terminal novo e confira:

```bash
git --version
```

O Git precisa de um nome e um e-mail para associar aos commits. Configure a identidade que usará na maioria dos projetos:

```bash
git config --global user.name "Seu nome"
git config --global user.email "seu-email@example.com"
git config --show-origin --get user.name
git config --show-origin --get user.email
```

`--global` salva a configuração para sua conta do sistema. Dentro de um repositório, você pode configurar valores locais sem `--global`; eles valem apenas para aquele projeto e substituem os valores globais. O nome e o e-mail gravados no commit são metadados de autoria. Eles **não** fazem login no GitHub.

Se preferir não publicar seu e-mail pessoal nos commits enviados ao GitHub, consulte as opções de privacidade de e-mail da sua conta e configure o endereço `noreply` indicado pelo próprio GitHub.

### Pratique e confira

Execute `git config --list --show-origin` e localize de onde vêm `user.name` e `user.email`. Não compartilhe a saída inteira de configuração sem revisar: outros valores podem conter dados locais.

**Fontes oficiais:** [Primeiros passos no GitHub: Git básico](https://docs.github.com/en/get-started/git-basics) · [Configuração inicial do Git](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)
