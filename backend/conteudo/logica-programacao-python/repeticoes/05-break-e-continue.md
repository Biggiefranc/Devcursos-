---
titulo: Interrompa ou pule uma repetição com cuidado
descricao: Use break e continue quando uma regra realmente altera o fluxo do laço.
ordem: 5
duracao: 12
video_url: null
material_url: null
---

# Ajuste o fluxo de uma repetição

`break` encerra o laço atual imediatamente. `continue` encerra a repetição atual e segue para a próxima. Os dois são úteis, mas uma condição de parada clara costuma ser mais fácil de acompanhar.

```python
for numero in range(1, 8):
    if numero == 5:
        break
    print(numero)
```

A saída é 1, 2, 3 e 4. Quando `numero` vale 5, o laço termina.

```python
for numero in range(1, 6):
    if numero == 3:
        continue
    print(numero)
```

O 3 é pulado; as outras quatro linhas são mostradas. Em um `while`, garanta que a atualização da condição aconteça também nos caminhos com `continue`, senão o laço pode não avançar.

## Pratique

Percorra de 1 a 10. Use `continue` para pular os pares e mostre apenas os ímpares. Depois explique por que `break` produziria outro comportamento.

**Documentação oficial:** [break e continue](https://docs.python.org/3/tutorial/controlflow.html#break-and-continue-statements)
