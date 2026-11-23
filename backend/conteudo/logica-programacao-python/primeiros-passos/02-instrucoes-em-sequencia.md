---
titulo: Instruções executadas em sequência
descricao: Entenda como a ordem das instruções muda o resultado de um programa.
ordem: 2
duracao: 20
video_url: null
material_url: null
---

## Leia o código na ordem em que ele roda

Quando você pega um livro emprestado, a biblioteca registra qual exemplar vai sair antes de imprimir o comprovante. O comprovante depende de uma etapa anterior. Nos programas simples que estamos escrevendo, Python também segue as instruções em sequência, da primeira linha para a última. Mais adiante, você vai aprender a mudar esse percurso.

```python
print("Separe o livro")
print("Mostre a carteirinha")
print("Pegue o comprovante")
```

Antes de executar o exemplo, escreva a saída que espera ver. Rode o código e compare a ordem. Depois mova a terceira linha para o topo. O interpretador vai seguir sua nova ordem, mesmo que ela tenha deixado de fazer sentido como orientação para quem usa a biblioteca.

## Algumas linhas dependem de outras

Em Python, você pode dar um nome a um valor. Esse nome é uma **variável**. Pense numa etiqueta com o nome do que você quer acompanhar. Em `livros_manha = 3`, o sinal `=` associa o nome `livros_manha` ao número `3`. Chamamos isso de **atribuição**. O caractere `_` ajuda a separar palavras no nome.

```python
livros_manha = 3
livros_tarde = 2
total = livros_manha + livros_tarde
print(total)
```

Na terceira linha, Python lê os dois valores, soma e atribui `5` a `total`. Na quarta, `print(total)` mostra esse número. Compare com `print("total")`, que mostra a palavra `total`. As aspas mudam o que a instrução pede.

## Descubra quais linhas podem trocar de lugar

1. **Inverta as atribuições da manhã e da tarde.** Preveja o resultado e execute. O total continua `5`, pois as duas atribuições são independentes e acontecem antes da soma.
2. **Mova o cálculo para o topo.** Execute e leia o `NameError`. Python tentou usar `livros_manha` antes de o nome receber um valor. Conserte o programa e confirme a saída.
3. **Mostre um resultado de cada vez.** Volte ao código que funcionava e acrescente `print(livros_manha)` logo depois da primeira atribuição. Acrescente `print(livros_tarde)` logo depois da segunda. Você deve obter `3`, `2` e `5`, em linhas diferentes. Se receber outra ordem, siga com o dedo a ordem dos `print`.

## Escreva a rotina de estudo

Para a prática com verificação, anote as três mensagens pedidas na ordem em que alguém deveria segui-las. Depois escreva um `print` por linha. Se a saída estiver na ordem certa e a verificação falhar, compare maiúsculas, acentos e pontuação com o enunciado.
