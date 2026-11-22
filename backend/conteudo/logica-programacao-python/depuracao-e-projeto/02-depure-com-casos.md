---
titulo: Depure com exemplos e casos de limite
descricao: Investigue uma saída errada com previsões, testes pequenos e limites.
ordem: 3
duracao: 20
video_url: null
material_url: null
---

# Descubra a primeira etapa errada

Quando a saída não bate, não reescreva o programa inteiro. Repita o processo: reproduza o erro, leia a mensagem, encontre a primeira linha cujo valor ficou errado, altere uma coisa e execute de novo.

Considere uma função que deveria somar os números de 1 a `limite`, incluindo o limite:

```python
def somar_ate(limite):
    total = 0
    for numero in range(1, limite):
        total = total + numero
    return total
```

Para `limite = 3`, ela soma 1 e 2, mas deixa 3 de fora. O caso pequeno revela que o limite de `range` não é incluído. A correção é usar `range(1, limite + 1)`.

Teste um caso comum e um de fronteira, como 1. Se o problema envolver uma lista, teste também uma lista vazia ou com um único item.

## Pratique

Corrija a função e confira `somar_ate(3) == 6` e `somar_ate(1) == 1`. Escreva uma frase explicando o erro antes de mudar o código.

**Documentação oficial:** [Erros e exceções](https://docs.python.org/3/tutorial/errors.html) · [range](https://docs.python.org/3/library/stdtypes.html#range)
