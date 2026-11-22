---
titulo: Leia números digitados

descricao: Converta o texto recebido por input para int ou float antes de calcular.
ordem: 3
duracao: 14
video_url: null
material_url: null
---

# Texto digitado não vira número sozinho

`input` sempre entrega texto. Para fazer uma conta com um número inteiro, converta a resposta com `int`; para aceitar casas decimais, use `float`.

```python
idade = int(input("Qual é sua idade? "))
proxima_idade = idade + 1
print(f"No próximo aniversário, você terá {proxima_idade}.")
```

Para uma medida ou preço decimal, use `float`. Na entrada, escreva a parte decimal com ponto, por exemplo `1.68`, mesmo que a configuração regional do computador use vírgula:

```python
altura = float(input("Altura em metros: "))
print(f"Altura informada: {altura} m")
```

A pessoa precisa digitar um valor compatível com a conversão. Se `int` receber letras ou um número decimal como `1.5`, Python apresentará um erro. Vamos aprender a ler erros e tratar entradas inválidas mais adiante.

## Faça agora

Peça dois números inteiros e mostre a soma. Teste `3` e `8`; a resposta deve ser `11`. Depois tente digitar `três` e observe a mensagem. O comportamento é uma pista sobre o que precisa ser validado.

**Documentação oficial:** [Funções `input`, `int` e `float`](https://docs.python.org/3/library/functions.html)
