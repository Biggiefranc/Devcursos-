---
titulo: Use uma repetição dentro de outra
descricao: Entenda repetições aninhadas e acompanhe qual variável controla cada nível.
ordem: 6
duracao: 12
video_url: null
material_url: null
---

# Uma repetição para cada dimensão

Uma repetição aninhada é um laço dentro de outro. Para cada volta do laço externo, o interno executa todas as suas voltas. Isso ajuda a representar linhas e colunas, dias e horários, ou combinações de valores.

```python
for linha in range(1, 4):
    for coluna in range(1, 3):
        print(f"linha {linha}, coluna {coluna}")
```

A saída terá seis linhas: duas colunas para cada uma das três linhas. A variável `linha` muda mais devagar; `coluna` percorre seus valores em cada volta externa.

Laços aninhados multiplicam o trabalho. Antes de adicionar um terceiro nível, pergunte se existe uma estrutura mais simples.

## Pratique

Mostre uma grade de 3 linhas por 4 colunas com pares como `(1, 1)` e `(3, 4)`. Conte quantas vezes o `print` é executado antes de rodar.

**Documentação oficial:** [Instruções for](https://docs.python.org/3/tutorial/controlflow.html#for-statements)
