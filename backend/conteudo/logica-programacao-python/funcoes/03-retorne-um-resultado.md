---
titulo: Retorne um resultado em vez de só imprimir
descricao: Diferencie exibir uma informação de devolver um valor para o restante do programa.
ordem: 3
duracao: 12
video_url: null
material_url: null
---

# print mostra; return devolve

Uma função que usa `print` exibe uma mensagem. Uma função que usa `return` devolve um valor para quem a chamou, que pode guardar, comparar ou usar em outro cálculo.

```python
def calcular_area(largura, altura):
    return largura * altura

area = calcular_area(4, 3)
print(area)
```

`return` encerra a função naquele ponto. O valor devolvido pode ser usado em outra expressão:

```python
def dobro(numero):
    return numero * 2

resultado = dobro(5) + 1
print(resultado)
```

A saída é `11`. Se a função apenas imprimisse o dobro, não poderia entregar esse número para a soma.

## Pratique

Escreva uma função `media(a, b, c)` que retorne a média. Guarde o resultado em uma variável e mostre depois. Experimente usar a função dentro de uma comparação.

**Documentação oficial:** [Instrução return](https://docs.python.org/3/reference/simple_stmts.html#the-return-statement)
