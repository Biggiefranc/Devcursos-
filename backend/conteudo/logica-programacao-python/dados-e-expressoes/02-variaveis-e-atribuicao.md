---
titulo: Guarde valores em variáveis
descricao: Use nomes claros para guardar e atualizar valores durante a execução.
ordem: 2
duracao: 12
video_url: null
material_url: null
---

# Um nome para um valor

Uma variável associa um nome a um valor. Escolha nomes que expliquem o papel daquele dado: `preco`, `quantidade` e `total` ajudam mais do que `a`, `b` e `c`.

```python
preco_unitario = 5.5
quantidade = 3
total = preco_unitario * quantidade
print(total)
```

A atribuição `total = ...` calcula o lado direito e guarda o resultado no nome `total`. Depois é possível atualizar um valor usando o próprio valor anterior:

```python
pontos = 0
pontos = pontos + 10
print(pontos)
```

A saída é `10`. A linha não diz que `pontos` é matematicamente igual a `pontos + 10`; ela calcula a expressão e substitui o valor guardado.

## Pratique

Crie `saldo = 20`, some 7 e depois subtraia 4. Mostre o saldo final. Renomeie variáveis para que alguém que nunca viu seu código consiga entender a conta.

**Documentação oficial:** [Atribuições e expressões](https://docs.python.org/3/tutorial/introduction.html#using-python-as-a-calculator)
