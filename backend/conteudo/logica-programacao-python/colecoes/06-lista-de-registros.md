---
titulo: Combine listas e dicionários
descricao: Represente vários registros e filtre-os com uma condição.
ordem: 6
duracao: 15
video_url: null
material_url: null
---

# Vários registros com campos

Uma lista pode guardar dicionários. Cada dicionário descreve um registro; a lista guarda vários registros na ordem em que foram adicionados.

```python
tarefas = [
    {"titulo": "Ler sobre variáveis", "concluida": True},
    {"titulo": "Praticar if", "concluida": False}
]

for tarefa in tarefas:
    if not tarefa["concluida"]:
        print(tarefa["titulo"])
```

O laço percorre cada tarefa. A condição seleciona as que ainda não foram concluídas. Essa combinação aparece em listas de alunos, produtos, livros e atividades.

Ao atualizar um campo dentro do laço, pense se a alteração deve valer apenas para o registro atual ou para todos. Teste com uma lista de um item e outra de vários itens.

## Pratique

Crie três livros com título e status de leitura. Percorra a coleção e mostre apenas os livros ainda não lidos.

**Documentação oficial:** [Dicionários](https://docs.python.org/3/tutorial/datastructures.html#dictionaries) · [Listas](https://docs.python.org/3/tutorial/datastructures.html#more-on-lists)
