---
titulo: Controle a parada do laço
descricao: Evite laços infinitos e mantenha visível o estado que faz a condição terminar.
ordem: 2
duracao: 12
video_url: null
material_url: null
---

# Todo laço precisa de uma saída

Um laço infinito costuma acontecer quando a condição permanece verdadeira. Compare:

```python
numero = 1
while numero <= 4:
    print(numero)
    numero = numero + 1
```

Com uma versão incompleta:

```python
numero = 1
while numero <= 4:
    print(numero)
    # sem atualização, numero continua valendo 1
```

Na segunda versão, a condição nunca muda. Se isso acontecer enquanto você testa, interrompa a execução pelo terminal e corrija a causa, em vez de acrescentar uma saída aleatória.

Uma boa condição descreve quando o trabalho acabou. Para ler até o usuário digitar `fim`, por exemplo, atualize a resposta a cada repetição.

```python
resposta = input("Digite algo ou fim: ")
while resposta != "fim":
    print(f"Você digitou: {resposta}")
    resposta = input("Digite algo ou fim: ")
```

## Pratique

Use esse padrão para repetir uma pergunta até receber uma palavra específica. Teste a palavra de saída logo na primeira resposta e também depois de duas respostas comuns.

**Documentação oficial:** [A instrução while](https://docs.python.org/3/reference/compound_stmts.html#the-while-statement)
