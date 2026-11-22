---
titulo: Guarde vários valores em uma lista
descricao: Crie uma sequência ordenada e acesse itens usando índices.
ordem: 1
duracao: 12
video_url: null
material_url: null
---

# Uma variável para uma coleção

Uma lista guarda vários valores em uma sequência. Os itens mantêm uma ordem, e o primeiro índice é `0`.

```python
notas = [8.5, 7, 9]
print(notas[0])
print(notas[1])
print(len(notas))
```

A saída é `8.5`, `7` e `3`. `len` informa quantos itens existem. Com três itens, os índices válidos são 0, 1 e 2; tentar acessar `notas[3]` gera um `IndexError`.

Uma lista vazia é escrita `[]`. Antes de acessar uma posição, pense se aquele item existe.

## Pratique

Crie uma lista com três matérias. Mostre a primeira e a última. Qual índice representa a última posição quando a lista tem três itens?

**Documentação oficial:** [Listas](https://docs.python.org/3/tutorial/datastructures.html#more-on-lists) · [Função len](https://docs.python.org/3/library/functions.html#len)
