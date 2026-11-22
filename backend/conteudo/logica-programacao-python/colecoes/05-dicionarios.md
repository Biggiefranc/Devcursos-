---
titulo: Organize informações com dicionários
descricao: Associe chaves a valores para representar dados com campos nomeados.
ordem: 5
duracao: 15
video_url: null
material_url: null
---

# Consulte pelo nome do campo

Uma lista representa uma sequência de itens. Um dicionário associa chaves a valores. Ele é útil quando os dados têm nomes, como título, prioridade e status.

```python
tarefa = {
    "titulo": "Revisar variáveis",
    "minutos": 20,
    "concluida": False
}

print(tarefa["titulo"])
tarefa["concluida"] = True
print(tarefa["concluida"])
```

A chave permite buscar o valor correspondente. `tarefa["campo"]` gera `KeyError` se a chave não existir. O método `get` permite consultar com um valor padrão:

```python
prioridade = tarefa.get("prioridade", "normal")
print(prioridade)
```

Pense numa chave como o nome de uma pergunta; o valor é a resposta guardada.

## Pratique

Crie um dicionário para um livro com `titulo`, `autor` e `lido`. Mostre cada campo e atualize `lido` após terminar a leitura.

**Documentação oficial:** [Dicionários](https://docs.python.org/3/tutorial/datastructures.html#dictionaries)
