---
titulo: Adicione, altere e remova itens
descricao: Atualize uma lista com atribuição e métodos comuns.
ordem: 2
duracao: 12
video_url: null
material_url: null
---

# Uma lista pode mudar

Listas são mutáveis: você pode substituir um item, acrescentar outro ou remover um valor.

```python
materias = ["lógica", "inglês"]
materias[1] = "redes"
materias.append("Python")
print(materias)
```

A saída é `['lógica', 'redes', 'Python']`. `append` acrescenta um item no fim. `remove(valor)` remove a primeira ocorrência daquele valor; se ele não existir, a operação gera `ValueError`.

```python
materias.remove("redes")
print(materias)
```

Confira o conteúdo antes de remover. Ao trabalhar com posições, lembre que inserir ou apagar um item pode mudar os índices seguintes.

## Pratique

Crie uma lista de três tarefas, acrescente uma quarta, altere a segunda e remova uma tarefa pelo valor. Mostre a lista depois de cada mudança.

**Documentação oficial:** [Métodos de listas](https://docs.python.org/3/tutorial/datastructures.html#more-on-lists)
