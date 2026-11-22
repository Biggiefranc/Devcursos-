---
titulo: Instruções executadas em sequência
descricao: Entenda como a ordem das instruções muda o resultado de um programa.
ordem: 2
duracao: 12
video_url: null
material_url: null
---

# A ordem muda o resultado

Uma receita funciona porque as etapas são feitas numa ordem que faz sentido. Um programa também executa as instruções seguindo o fluxo do código, de cima para baixo, exceto quando uma condição ou repetição muda esse caminho.

```python
print("1. Separar os ingredientes")
print("2. Misturar")
print("3. Levar ao forno")
```

Se trocar as linhas, Python mostra a saída na nova ordem. O computador não adivinha a intenção: ele segue as instruções que recebeu.

Uma solução bem escrita tem começo, etapas e resultado. Quando uma etapa depende de outra, essa dependência precisa aparecer na sequência. Primeiro calculamos um subtotal; depois usamos esse subtotal para calcular o total.

```python
preco_caderno = 12
preco_caneta = 4
total = preco_caderno + preco_caneta
print(total)
```

## Pratique

Mude a ordem das duas primeiras atribuições e execute. O total continua igual porque as duas compras podem ser somadas em qualquer ordem. Depois tente imprimir `total` antes de calcular seu valor: observe que o programa não consegue usar um nome que ainda não recebeu um valor.

**Pergunta de revisão:** qual instrução precisa acontecer antes de `print(total)`?

**Documentação oficial:** [Uma introdução informal ao Python](https://docs.python.org/3/tutorial/introduction.html)
