---
titulo: Faça contas com operadores
descricao: Use operadores aritméticos e parênteses para expressar um cálculo sem ambiguidades.
ordem: 4
duracao: 12
video_url: null
material_url: null
---

# Cada operador tem um trabalho

Os operadores aritméticos mais comuns são `+` soma, `-` subtração, `*` multiplicação, `/` divisão, `//` divisão inteira, `%` resto e `**` potência. Parênteses deixam explícita a ordem desejada.

```python
print(2 + 3 * 4)       # 14
print((2 + 3) * 4)     # 20
print(17 // 5)         # 3
print(17 % 5)          # 2
print(3 ** 2)          # 9
```

A multiplicação acontece antes da soma. `/` produz uma divisão comum; `//` arredonda o quociente para baixo (para valores positivos, isso corresponde à parte inteira). O operador `%` é útil para descobrir o resto, por exemplo se um número é divisível por outro.

## Pratique

1. Preveja as cinco saídas antes de executar.
2. Troque `17` por `18` nos exemplos de divisão inteira e resto.
3. Escreva uma expressão para calcular a média de três notas. Use parênteses para deixar claro o que será dividido.

**Documentação oficial:** [Expressões aritméticas](https://docs.python.org/3/tutorial/introduction.html#numbers) · [Precedência de operadores](https://docs.python.org/3/reference/expressions.html#operator-precedence)
