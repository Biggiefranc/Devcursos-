---
titulo: "Oficina do módulo: laços com propósito"
descricao: Pratique condições de parada, range, contadores e acumuladores.
ordem: 7
duracao: 40
video_url: null
material_url: null
---

# Oficina 4 — repita sem perder o controle

Tente prever quantas vezes o laço roda e qual será o resultado antes de executar.

## Desafios

1. Mostre de 10 até 1 e depois escreva `Fim`.
2. Some os números de 1 a 100 usando um acumulador.
3. Leia números inteiros até que a pessoa digite `0`; mostre quantos números diferentes de zero foram informados.
4. Mostre a tabuada de 1 a 3, cada uma de 1 a 5.

## Solução possível para o desafio 2

```python
soma = 0
for numero in range(1, 101):
    soma = soma + numero
print(soma)
```

O resultado é `5050`. `range(1, 101)` inclui 1 e não inclui 101.

## Investigue

Se o resultado sair 4950, examine o limite inicial. Se sair 5151, examine o limite final. Erros de uma unidade muitas vezes começam na escolha de `range`.

**Revisão:** cada laço tem uma condição de parada ou uma quantidade finita? Contadores começam no valor certo? Acumuladores são reinicializados antes de cada novo cálculo?

**Documentação oficial:** [Instruções `for`, `while`, `break` e `continue`](https://docs.python.org/3/tutorial/controlflow.html) · [Função `range`](https://docs.python.org/3/library/stdtypes.html#range)
