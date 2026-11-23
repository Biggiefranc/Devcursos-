---
titulo: "Oficina do módulo: transforme uma ideia em programa"
descricao: Pratique sequência, entrada, processamento, saída e rastreamento.
ordem: 6
duracao: 40
video_url: null
material_url: null
---

## Planeje uma solução antes de abrir o editor

Nesta oficina você vai passar de um pedido em português a um programa testado. Para cada desafio, anote os dados de entrada, descreva a regra e escreva um exemplo de saída. Se a saída for diferente da previsão, volte aos passos e localize a primeira diferença.

### Exemplo guiado. Conte as revistas da biblioteca

A biblioteca recebeu 3 caixas com 5 revistas em cada. Já havia mais 4 revistas separadas. Qual é o total? A resposta depende de dois cálculos. Primeiro conte as revistas das caixas. Depois some as que estavam separadas.

```python
caixas = 3
revistas_por_caixa = 5
separadas = 4
revistas_nas_caixas = caixas * revistas_por_caixa
total = revistas_nas_caixas + separadas
print(total)
```

Faça a conta antes de executar. A quarta linha dá `15`, e a quinta dá `19`. Depois use `0` caixas. A quarta linha deve passar a `0` e a saída deve ser `4`. Esse teste ajuda a descobrir, por exemplo, se você esqueceu de somar as revistas separadas.

### Desafio 1. Escreva uma ficha de leitura

Leia duas linhas da entrada. A primeira tem o nome de quem leu e a segunda tem o nome do livro. Mostre uma frase no formato `Lia leu O Pequeno Príncipe.`. Teste com `Ravi` e `A Ilha do Tesouro`; espere `Ravi leu A Ilha do Tesouro.`.

Se o nome da pessoa e o do livro aparecerem trocados, confira em qual ordem você digitou as respostas e a que variável cada `input()` atribuiu o texto. A frase deve mudar junto com a entrada.

### Desafio 2. Organize os minutos de estudo

Uma pessoa fez 3 sessões de 20 minutos e depois uma revisão de 8 minutos. Use valores fixos. Escreva o cálculo em duas etapas e mostre o total em minutos. Teste também 1 sessão de 20 minutos e 0 de revisão. As saídas esperadas são `68` e `20`.

Se aparecer `31` no primeiro teste, confira se usou `+` onde precisava de `*`. Tente explicar o que representa cada resultado intermediário antes de mexer novamente no código.

### Desafio 3. Investigue um total que diminuiu

O programa abaixo deveria terminar com `17`. Rastreie `paginas` linha por linha para encontrar a atribuição que faz o valor diminuir.

```python
paginas = 6
paginas = paginas + 4
paginas = 7
print(paginas)
```

A terceira linha deveria somar 7 ao que já foi lido. Corrija essa linha e execute. Em seguida, troque o primeiro número por `0`. O resultado deve ser `11`.

## Prática com verificação

No exercício final da aula, você tem o número de páginas lidas de manhã e à tarde no código inicial. Escreva a soma usando os dois nomes e exiba o total em uma linha. Antes de verificar, faça um segundo teste com zero páginas à tarde. Nesse teste, o total precisa ser igual à leitura da manhã. Restaure os valores do enunciado antes de clicar em **Verificar exercício**.
