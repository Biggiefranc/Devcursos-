---
titulo: Transforme um problema em algoritmo
descricao: Separe um problema em dados de entrada, processamento e resultado esperado.
ordem: 3
duracao: 25
video_url: null
material_url: null
---

## Transforme o pedido em passos que alguém possa seguir

Uma colega pede ajuda para vender ingressos. Ela conhece o preço de um ingresso e a quantidade que uma pessoa quer comprar. “Descubra quanto ela deve pagar” é o problema. “Multiplique o preço por unidade pela quantidade e mostre o resultado” já descreve como resolvê-lo.

Um **algoritmo** é uma sequência de passos definidos para resolver um problema. Para esta tarefa, ele tem um fim claro. Acaba depois de mostrar o total. Você pode escrever o algoritmo em português, testar no papel e então traduzir os passos para código.

- **Entrada** é o que a solução precisa conhecer. Aqui são o preço por ingresso e a quantidade.
- **Processamento** é a regra aplicada aos dados. Aqui é a multiplicação.
- **Saída** é o resultado que interessa a quem fez o pedido. Aqui é o total em reais.

## Do papel ao Python

Faça de conta que você vai passar o trabalho para alguém que nunca vendeu um ingresso. Que dados você teria de entregar? Qual é a conta? Em que momento a pessoa sabe que terminou? Escreva o plano sem se preocupar com a sintaxe.

```text
Obter o preço de um ingresso.
Obter a quantidade de ingressos.
Multiplicar o preço pela quantidade.
Mostrar o total.
```

A partir desse plano, use valores escritos no código. Na próxima aula você vai aprender a ler entradas digitadas.

```python
preco = 8
quantidade = 3
total = preco * quantidade
print(total)
```

O asterisco `*` é o símbolo de multiplicação em Python. Na linha de `total`, o interpretador faz `8 * 3` e associa `24` ao nome `total`. O `print` mostra esse valor. A mesma regra serve para outros preços e quantidades.

## Teste sua regra com valores diferentes

1. **Faça uma previsão.** Com preço `8` e quantidade `1`, o total precisa ser `8`. Escreva a previsão, mude o código e execute.
2. **Procure um caso que denuncie uma conta errada.** Com preço `8` e quantidade `0`, a saída deve ser `0`. Troque temporariamente `*` por `+`. A previsão continua sendo `0`, mas o código agora mostra `8`. Volte à multiplicação.
3. **Resolva outro pedido.** Uma caixa fecha com 6 lápis e você tem 4 caixas iguais. Escreva a entrada, a regra e a saída antes de montar o programa. Confira `24`. Depois descubra quantos lápis há em 2 caixas. A saída esperada é `12`.

## Prática com verificação

O exercício tem o mesmo cenário, com três ingressos a 18 reais. Escreva a conta no papel para ter uma saída esperada. No editor, use os nomes que já receberam os dados, faça o cálculo e mostre o resultado. Se seu programa ainda tiver o preço de um exemplo anterior, restaure o código inicial pelo editor antes de começar.
