---
titulo: Percorra sequências com for e range
descricao: Use for quando a repetição percorre itens ou uma quantidade conhecida de números.
ordem: 3
duracao: 13
video_url: null
material_url: null
---

# Quando a quantidade de repetições é conhecida

`for` percorre os itens de uma sequência. `range` fornece uma sequência de números sem incluir o limite final.

```python
for numero in range(1, 5):
    print(numero)
```

A saída é 1, 2, 3 e 4. O primeiro argumento indica onde começar; o segundo marca o limite que não entra. Essa regra evita incluir um valor a mais sem perceber.

Você também pode percorrer diretamente os itens de uma lista, quando aprender coleções. Para contar de zero até quatro, `range(5)` é suficiente; para começar em um, use `range(1, 5)`.

```python
for volta in range(3):
    print("Uma volta concluída")
```

## Pratique

Mostre a tabuada do 7 de 1 a 10. Confira se aparecem dez linhas e se a última é `7 x 10 = 70`.

**Documentação oficial:** [A instrução for](https://docs.python.org/3/tutorial/controlflow.html#for-statements) · [range](https://docs.python.org/3/library/stdtypes.html#range)
