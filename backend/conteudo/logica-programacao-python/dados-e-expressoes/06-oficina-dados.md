---
titulo: "Oficina do módulo: calcule uma compra"

descricao: Pratique variáveis, conversões, contas e apresentação de resultados.
ordem: 6
duracao: 35
video_url: null
material_url: null
---

# Oficina 2 — transforme dados em resultado

Tente montar cada solução antes de olhar o exemplo resolvido. Teste com valores pequenos para conferir a conta à mão.

## Desafios

1. Leia o preço de um item e a quantidade comprada. Mostre o total com duas casas decimais.
2. Leia uma duração em minutos e mostre quantas horas completas e quantos minutos sobraram.
3. Leia três notas e calcule a média.
4. Explique por que `"8" + "2"` resulta em `"82"`, mas `int("8") + int("2")` resulta em `10`.

## Solução possível para o desafio 2

```python
minutos = int(input("Duração em minutos: "))
horas = minutos // 60
resto = minutos % 60
print(f"{horas} hora(s) e {resto} minuto(s)")
```

Para `135`, o resultado é `2 hora(s) e 15 minuto(s)`. O operador `//` encontra as horas completas; `%` encontra o que sobrou.

## Autoavaliação

Você sabe dizer o tipo de cada valor? Converteu a entrada antes da conta? Testou um valor exato, como `120`, e um com resto, como `135`?

**Documentação oficial:** [Tipos numéricos](https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex) · [Expressões aritméticas](https://docs.python.org/3/tutorial/introduction.html#numbers)
