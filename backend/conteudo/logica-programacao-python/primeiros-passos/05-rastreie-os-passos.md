---
titulo: Rastreie os passos de um algoritmo
descricao: Acompanhe como cada instrução altera os valores usados pelo programa.
ordem: 5
duracao: 12
video_url: null
material_url: null
---

# Pare e acompanhe o valor

Quando um resultado surpreende, execute o programa mentalmente uma linha por vez. Anote o valor de cada nome depois da instrução que o altera.

```python
pontos = 2
pontos = pontos + 3
bonus = 4
pontos = pontos + bonus
print(pontos)
```

Acompanhe: `pontos` começa em 2; depois passa a 5; `bonus` recebe 4; por fim `pontos` passa a 9. O sinal `=` atribui o valor da expressão à direita ao nome da esquerda. Ele não é uma pergunta de igualdade.

Essa técnica se chama rastreamento. É útil antes de executar e também ao procurar um erro: descubra a primeira linha em que o valor deixa de ser o esperado.

## Pratique

Troque `bonus = 4` por `bonus = 0` e preveja a saída antes de rodar. Depois troque `pontos = pontos + bonus` por `pontos = bonus` e explique por que o valor final muda.

**Documentação oficial:** [Uma introdução informal ao Python](https://docs.python.org/3/tutorial/introduction.html)
