---
titulo: Conte repetições e acumule resultados
descricao: Atualize variáveis para contar itens ou somar valores durante um laço.
ordem: 4
duracao: 13
video_url: null
material_url: null
---

# Guarde o resultado parcial

Um contador acompanha quantas vezes algo ocorreu. Um acumulador guarda um resultado que cresce, como uma soma. Os dois precisam de um valor inicial antes do laço.

```python
soma = 0

for numero in range(1, 6):
    soma = soma + numero

print(soma)
```

O programa soma 1, 2, 3, 4 e 5. A resposta é 15. Se `soma` começasse em 1, o resultado seria 16; escolha o valor inicial de acordo com a operação.

```python
quantidade = 0
for numero in range(1, 6):
    quantidade = quantidade + 1
print(quantidade)
```

Aqui usamos o laço para contar cinco números. Muitos programas usam contador e acumulador juntos: contar notas e somar seus valores para depois calcular a média.

## Pratique

Some os números pares de 2 até 10. Antes de executar, anote quais valores entram e qual você espera como total.

**Documentação oficial:** [Instruções for](https://docs.python.org/3/tutorial/controlflow.html#for-statements) · [range](https://docs.python.org/3/library/stdtypes.html#range)
