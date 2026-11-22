---
titulo: Entenda uma rejeição de push
descricao: Investigue quando o remoto tem commits que sua branch ainda não integrou.
ordem: 5
duracao: 15
video_url: null
material_url: null
---

# Um push rejeitado pede investigação

O remoto pode ter commits que ainda não estão na sua branch local. Por segurança, o Git pode rejeitar um push que apagaria ou deixaria de incluir esse trabalho.

Comece por:

```bash
git status -sb
git fetch origin
git log --oneline --graph --decorate --all
```

Identifique sua branch, a referência remota correspondente e os commits que existem em cada lado. Se o fluxo do projeto usa merge, atualize sua branch com a remota e resolva conflitos, se houver. Se o projeto usa rebase, siga a convenção da equipe e entenda que ele reaplica commits locais sobre outra base. Depois revise o histórico e tente enviar novamente.

Não use `git push --force` como tentativa genérica de corrigir rejeições: ele pode substituir commits no remoto. Em branch compartilhada, confirme com a equipe e siga a política do repositório.

### Mini prática

Em um projeto de teste, crie commits diferentes em dois clones e observe como o segundo push é rejeitado. Use `fetch` e o gráfico do histórico para explicar a divergência antes de integrá-la.

**Fontes oficiais:** [git-push](https://git-scm.com/docs/git-push) · [git-fetch](https://git-scm.com/docs/git-fetch) · [Branches remotas no Pro Git](https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches)
