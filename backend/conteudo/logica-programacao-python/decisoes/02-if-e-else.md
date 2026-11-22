---
titulo: Escolha um caminho com if e else
descricao: Execute blocos diferentes dependendo de uma condição.
ordem: 2
duracao: 12
video_url: null
material_url: null
---

# Se isso acontecer, faça aquilo

`if` executa um bloco quando a condição é verdadeira. `else` fornece outro caminho quando ela é falsa. Os dois-pontos abrem o bloco e a indentação mostra quais linhas pertencem a ele.

```python
idade = int(input("Sua idade: "))

if idade >= 18:
    print("Você é maior de idade.")
else:
    print("Você ainda é menor de idade.")
```

As duas mensagens não aparecem juntas: exatamente um caminho é escolhido. Em Python, use a mesma indentação para as instruções do bloco. Quatro espaços são a convenção mais comum.

## Pratique

Mude a condição para classificar uma temperatura: abaixo de 18, mostre `Leve um casaco`; caso contrário, mostre `Roupa leve pode bastar`. Teste com `17` e `18` para conferir a fronteira.

**Documentação oficial:** [A instrução if](https://docs.python.org/3/tutorial/controlflow.html#if-statements)
