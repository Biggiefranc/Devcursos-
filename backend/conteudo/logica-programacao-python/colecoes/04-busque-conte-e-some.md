---
titulo: Busque, conte e some itens
descricao: Combine laços, condições e acumuladores para responder perguntas sobre uma lista.
ordem: 4
duracao: 15
video_url: null
material_url: null
---

# Faça perguntas sobre uma coleção

Um laço pode contar quantos itens satisfazem uma regra ou acumular seus valores.

```python
notas = [6, 8, 9, 5]
aprovadas = 0
soma = 0

for nota in notas:
    soma = soma + nota
    if nota >= 7:
        aprovadas = aprovadas + 1

print(aprovadas)
print(soma / len(notas))
```

O programa conta duas notas de pelo menos 7 e calcula a média. `len(notas)` é 4, então a lista não está vazia neste exemplo. Se ela puder estar vazia, trate esse caso antes de dividir.

Para procurar um valor, use `if item == alvo` dentro do laço. Para uma busca simples, `alvo in lista` também verifica se o valor está presente.

## Pratique

Com `[4, 7, 2, 9, 7]`, conte quantas vezes aparece o 7 e some apenas os valores maiores que 5. Preveja os resultados antes de executar.

**Documentação oficial:** [Listas e métodos](https://docs.python.org/3/tutorial/datastructures.html#more-on-lists) · [Operadores de comparação](https://docs.python.org/3/reference/expressions.html#comparisons)
