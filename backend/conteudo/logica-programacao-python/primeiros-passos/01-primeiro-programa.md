---
titulo: Seu primeiro programa conversa com Python
descricao: Execute um arquivo simples e veja como uma instrução produz uma saída.
ordem: 1
duracao: 18
video_url: null
material_url: null
---

## Escreva a primeira instrução

Imagine um painel na entrada de uma escola. Para que ele mostre uma mensagem, alguém precisa escrever o que deve aparecer. Seu primeiro programa vai fazer isso. Um **programa** é um conjunto de instruções que o computador pode executar. Python é a linguagem em que você vai escrever essas instruções. O **interpretador** é o programa que lê o código Python e o executa.

Abra o editor desta aula, troque o conteúdo pelo exemplo abaixo e clique em **Executar código**. Dá para fazer toda a aula no navegador.

```python
print("Olá, mundo!")
```

Na área **Saída do programa**, você deve ler `Olá, mundo!`. Essa é a saída, ou seja, o que o programa mostrou. A linha com `print` é o código que produziu a saída.

Leia a instrução da esquerda para a direita. `print` é o nome de uma função pronta do Python. Uma função é uma operação que você pode chamar pelo nome. Os parênteses delimitam o que você envia para ela. As aspas marcam o começo e o fim do texto. Elas fazem parte do código e ficam de fora da mensagem exibida. Python chama um valor de texto de **string**.

## Faça um teste de cada vez

**Troque só o texto.** Mude `Olá, mundo!` para `Boa tarde!` e execute de novo. A nova frase deve aparecer exatamente como você a escreveu, com a exclamação. Mantenha as aspas e os parênteses.

**Mostre duas mensagens.** Digite estas linhas e, antes de executar, tente dizer qual mensagem vem primeiro.

```python
print("Biblioteca aberta")
print("Pegue sua carteirinha")
```

Depois inverta as duas linhas. A primeira mensagem da saída deve passar a ser `Pegue sua carteirinha`. Cada `print` do exemplo termina com uma quebra de linha.

**Provoque um erro e corrija.** Apague a segunda aspa da última linha e execute. Procure `SyntaxError` no erro. **Sintaxe** é o conjunto de regras para escrever uma instrução válida. Quando falta uma aspa, o interpretador não consegue ler o código todo. Coloque a aspa de volta e confirme que as duas mensagens voltaram.

## Prática com verificação

Monte um pequeno cartaz com duas linhas, uma com o nome de um lugar e outra com uma orientação sua. Experimente trocar a pontuação e veja o que sai. Em seguida, substitua o código pela frase exata pedida no exercício. Use **Executar código** para conferir a saída e **Verificar exercício** quando estiver pronto.

Se quiser repetir no computador, salve o código em `ola.py`. Com o Python 3 instalado pelo [site do Python](https://www.python.org/downloads/), abra o terminal na pasta do arquivo e use `python3 ola.py`, `python ola.py` ou `py ola.py`, conforme o comando disponível no seu sistema. No editor desta aula, você cola só o código Python.
