---
titulo: Transforme um problema em algoritmo
descricao: Separe um problema em dados de entrada, processamento e resultado esperado.
ordem: 3
duracao: 15
video_url: null
material_url: null
---

# Antes do código, deixe a solução explícita

Um algoritmo é uma sequência finita de passos para alcançar um resultado. Para começar, pergunte:

- **Entrada:** que informação tenho ou preciso pedir?
- **Processamento:** que regra ou cálculo transforma essa informação?
- **Saída:** como vou apresentar o resultado?

Problema: calcular o preço de duas unidades iguais. Uma solução em palavras seria: pedir o preço, pedir a quantidade, multiplicar e mostrar o total.

```text
ler preço
ler quantidade
calcular preço * quantidade
mostrar total
```

Agora uma versão em Python, com os valores escritos no código:

```python
preco = 7.5
quantidade = 3
total = preco * quantidade
print(total)
```

O resultado deve ser `22.5`. A lista em palavras ajuda a encontrar etapas faltantes antes de se preocupar com detalhes da sintaxe.

## Tente sem copiar

Escreva os passos para calcular o dobro de um número e mostrar o resultado. Depois traduza cada passo para Python usando um valor fixo. Confira se seu programa faz o dobro, e não a metade ou o triplo.

**Documentação oficial:** [Uma introdução informal ao Python](https://docs.python.org/3/tutorial/introduction.html)
