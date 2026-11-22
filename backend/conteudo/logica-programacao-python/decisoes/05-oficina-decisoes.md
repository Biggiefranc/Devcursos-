---
titulo: "Oficina do módulo: regras de aprovação"
descricao: Pratique comparações, faixas e condições combinadas.
ordem: 5
duracao: 35
video_url: null
material_url: null
---

# Oficina 3 — transforme regras em decisões

Escreva a regra em português e teste os limites antes de considerar a solução pronta.

## Desafios

1. Leia uma nota de 0 a 10. Se estiver fora desse intervalo, informe que ela é inválida; de 7 para cima, aprove; caso contrário, informe que precisa de recuperação.
2. Leia a idade. Classifique como criança (até 12), adolescente (13 a 17) ou adulto (18 ou mais).
3. Uma atividade é aceita se foi entregue no prazo **ou** se possui justificativa aprovada. Modele as duas condições.
4. Para o desafio 1, teste `-1`, `0`, `6.9`, `7`, `10` e `11`.

## Uma solução possível para o desafio 1

```python
nota = float(input("Nota: "))

if nota < 0 or nota > 10:
    print("Nota inválida")
elif nota >= 7:
    print("Aprovado")
else:
    print("Recuperação")
```

O primeiro `if` valida o domínio dos dados. As decisões seguintes só são avaliadas quando a nota está no intervalo.

**Revisão:** você explicou o que acontece em cada fronteira? Se duas condições forem verdadeiras, o encadeamento executa apenas a primeira delas.

**Documentação oficial:** [Instruções `if`](https://docs.python.org/3/tutorial/controlflow.html#if-statements) · [Operações booleanas](https://docs.python.org/3/reference/expressions.html#boolean-operations)
