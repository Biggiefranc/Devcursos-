---
titulo: "Oficina do módulo: transforme uma ideia em programa"
descricao: Pratique sequência, entrada, processamento, saída e rastreamento.
ordem: 6
duracao: 30
video_url: null
material_url: null
---

# Oficina 1 — do enunciado à execução

Tente resolver os desafios antes de consultar a solução. Para cada um, escreva primeiro os passos em português e só depois programe.

## Desafios

1. Peça o nome e mostre uma saudação personalizada.
2. Receba a quantidade de páginas lidas em dois dias e mostre o total.
3. Receba o preço de um item e a quantidade; calcule o total com valores fixos primeiro.
4. Leia o programa abaixo e preveja a saída linha a linha.

```python
paginas = 8
paginas = paginas + 5
revisao = 2
total = paginas + revisao
print(total)
```

## Uma solução possível para o desafio 3

```python
preco = 6
quantidade = 4
total = preco * quantidade
print(total)
```

A saída é `24`. Agora adapte para ler os valores digitados. Ainda vamos estudar conversão de números; por enquanto, resolva o cálculo usando valores definidos no código.

## Critérios de revisão

- Você identificou quais dados entram?
- As etapas de cálculo aparecem antes da saída?
- Consegue explicar o valor de cada variável?
- Testou pelo menos dois conjuntos de valores?

**Revisão do módulo:** uma solução programada começa com um problema claro, passos ordenados e uma forma de conferir o resultado.

**Documentação oficial:** [Funções `input` e `print`](https://docs.python.org/3/library/functions.html) · [Introdução ao Python](https://docs.python.org/3/tutorial/introduction.html)
