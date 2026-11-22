---
titulo: "Oficina do módulo: organize uma coleção de estudos"
descricao: Pratique listas, dicionários, busca e atualização de registros.
ordem: 7
duracao: 40
video_url: null
material_url: null
---

# Oficina 6 — uma lista de leituras

Monte uma lista com dicionários. Cada livro tem título e estado de leitura.

```python
livros = [
    {"titulo": "Algoritmos", "lido": True},
    {"titulo": "Python básico", "lido": False},
    {"titulo": "Estruturas", "lido": False}
]
```

## Desafios

1. Mostre todos os títulos.
2. Conte quantos ainda não foram lidos.
3. Marque `Python básico` como lido.
4. Mostre a porcentagem de livros concluídos; trate a lista vazia sem dividir por zero.

## Uma solução possível para os desafios 2 e 3

```python
pendentes = 0
for livro in livros:
    if not livro["lido"]:
        pendentes = pendentes + 1

for livro in livros:
    if livro["titulo"] == "Python básico":
        livro["lido"] = True

print(pendentes)
```

O primeiro laço conta o estado original; o segundo atualiza o registro encontrado. Se quiser que a contagem reflita a alteração, conte novamente depois de atualizar.

**Revisão:** cada dado tem o tipo certo? Você percorreu todos os itens? E se o título procurado não existir?

**Documentação oficial:** [Listas](https://docs.python.org/3/tutorial/datastructures.html#more-on-lists) · [Dicionários](https://docs.python.org/3/tutorial/datastructures.html#dictionaries)
