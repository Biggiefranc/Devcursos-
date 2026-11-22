---
titulo: Combine condições com and, or e not
descricao: Construa regras usando mais de uma comparação.
ordem: 4
duracao: 12
video_url: null
material_url: null
---

# Regras com mais de uma parte

`and` exige que as duas condições sejam verdadeiras. `or` aceita que pelo menos uma seja verdadeira. `not` inverte um resultado lógico.

```python
idade = 16
acompanhado = True

if idade >= 18 or acompanhado:
    print("Entrada permitida")
else:
    print("Entrada não permitida")
```

Parênteses ajudam a explicar regras que misturam operadores:

```python
nota = 8
trabalhos_entregues = True
aprovado = (nota >= 7) and trabalhos_entregues
print(aprovado)
```

Não confunda uma expressão com `and` com duas instruções `if`: uma produz um resultado lógico e outra controla qual bloco será executado. Escreva a regra em palavras antes de traduzi-la.

## Pratique

Uma pessoa pode acessar uma área se tem autorização **e** a conta está ativa. Escreva duas variáveis booleanas e uma condição. Depois troque `and` por `or` e explique como a regra mudou.

**Documentação oficial:** [Operações booleanas](https://docs.python.org/3/reference/expressions.html#boolean-operations)
