---
titulo: "Oficina do módulo: funções úteis e testáveis"
descricao: Transforme cálculos em funções pequenas e confira seus resultados.
ordem: 7
duracao: 40
video_url: null
material_url: null
---

# Oficina 5 — resolva com funções

Para cada desafio, escreva primeiro exemplos de entrada e resultado. Depois implemente uma função que recebe dados e retorna um valor.

## Desafios

1. Crie `calcular_desconto(preco, percentual)`. Para `100` e `10`, a função deve retornar `90`.
2. Crie `media(notas)` para três notas recebidas como parâmetros individuais. Retorne a média; deixe a apresentação para outra função.
3. Crie `pode_passar(media)`, que retorna `True` quando a média é pelo menos 7.
4. Escreva três `assert` para cada função, incluindo um valor de limite.

## Solução possível para o desafio 1

```python
def calcular_desconto(preco, percentual):
    valor_desconto = preco * percentual / 100
    return preco - valor_desconto

assert calcular_desconto(100, 10) == 90
assert calcular_desconto(50, 0) == 50
```

A função não pergunta dados nem imprime. Essa separação permite reutilizá-la em outro programa.

**Revisão:** cada função tem um propósito? Os parâmetros são suficientes? O resultado pode ser testado sem ler a tela?

**Documentação oficial:** [Definindo funções](https://docs.python.org/3/tutorial/controlflow.html#defining-functions) · [Instrução `assert`](https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement)
