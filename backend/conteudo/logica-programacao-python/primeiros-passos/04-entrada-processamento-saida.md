---
titulo: Entrada, processamento e saída

descricao: Leia uma resposta com input, transforme-a em um dado e apresente um resultado.
ordem: 4
duracao: 12
video_url: null
material_url: null
---

# Faça o programa conversar

Até agora, os valores estavam escritos no arquivo. Com `input`, o programa pode pedir uma resposta durante a execução. O que a pessoa digita chega inicialmente como texto.

```python
nome = input("Como você se chama? ")
print("Olá,", nome)
```

O programa mostra a pergunta, espera a resposta e depois usa o texto recebido. O espaço no fim da pergunta deixa a digitação visualmente separada.

Um problema pode ser descrito como um fluxo: receber dados, processá-los e apresentar uma saída. Nesta aula a entrada é um nome. Quando receber números, precisaremos converter o texto para um tipo numérico; faremos isso no módulo seguinte.

## Pratique

Adapte o programa para perguntar a cidade e mostrar uma frase como `Você estuda em Fortaleza.`. Depois peça nome e cidade em duas entradas diferentes.

**Confira:** cada `input` precisa guardar a resposta em um nome que você use depois. Se a saída mostrar uma palavra que você escreveu diretamente no código, reveja qual variável passou para `print`.

**Documentação oficial:** [Funções de entrada e saída](https://docs.python.org/3/tutorial/inputoutput.html) · [Função `input`](https://docs.python.org/3/library/functions.html#input)
