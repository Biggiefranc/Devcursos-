---
titulo: Números, textos e valores lógicos
descricao: Reconheça os tipos de dados mais usados nos primeiros programas.
ordem: 1
duracao: 12
video_url: null
material_url: null
---

# O tipo depende do significado

Python trabalha com valores de tipos diferentes. `int` representa números inteiros; `float`, números com parte decimal; `str`, texto; e `bool`, um valor lógico que pode ser `True` ou `False`.

```python
idade = 16
altura = 1.68
nome = "Lia"
matriculada = True

print(type(idade))
print(type(altura))
print(type(nome))
print(type(matriculada))
```

As aspas fazem parte da escrita do texto no código, não do texto exibido. `16` e `"16"` parecem semelhantes para uma pessoa, mas um é número e o outro é texto. Isso importa: números podem ser somados; textos podem ser unidos; misturar tipos sem conversão pode causar erro.

## Pratique

Crie uma variável para o nome de um livro, outra para o ano de publicação e outra para indicar se você já o leu. Confira cada tipo usando `type`.

**Documentação oficial:** [Tipos numéricos](https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex) · [Tipo texto](https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str) · [Valores booleanos](https://docs.python.org/3/library/stdtypes.html#truth-value-testing)
