---
titulo: Teste uma função com exemplos
descricao: Confira resultados esperados e inclua casos de limite.
ordem: 6
duracao: 15
video_url: null
material_url: null
---

# Não confie só no primeiro exemplo

Teste uma função com valores para os quais você consegue prever o resultado. Inclua um caso comum, um limite e um caso que poderia revelar uma regra errada.

```python
def eh_par(numero):
    return numero % 2 == 0

assert eh_par(4) is True
assert eh_par(7) is False
assert eh_par(0) is True
```

`assert` interrompe o programa com erro se a condição for falsa. Aqui os exemplos documentam a regra: múltiplos de 2, incluindo zero, são pares. Em projetos maiores, usamos ferramentas de teste próprias; por enquanto, `assert` ajuda a experimentar funções pequenas.

Teste também entradas inválidas quando a função tiver uma regra de validação. Pense no que deve acontecer antes de escrever o código.

## Pratique

Escreva `maior_de_dois(a, b)` e teste quando `a` é maior, quando `b` é maior e quando os valores são iguais. Decida explicitamente o que a função devolve no empate.

**Documentação oficial:** [Instrução assert](https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement)
