---
titulo: Monte mensagens com texto e f-strings
descricao: Combine dados com mensagens legíveis usando literais de texto formatados.
ordem: 5
duracao: 12
video_url: null
material_url: null
---

# Mostre o resultado com clareza

Textos podem ser unidos, mas para uma frase que contém valores uma f-string costuma ser mais fácil de ler. Coloque `f` antes das aspas e escreva o nome da variável entre chaves.

```python
nome = "Bia"
livros = 3
print(f"{nome} leu {livros} livros neste mês.")
```

O texto entre aspas é uma mensagem. `{nome}` e `{livros}` são substituídos pelos valores atuais das variáveis. Em números decimais, é possível escolher quantas casas aparecem:

```python
preco = 7.5
print(f"Preço: R$ {preco:.2f}")
```

A saída fica `Preço: R$ 7.50`. Isso muda a apresentação, não a precisão guardada na variável.

## Pratique

Peça um produto e um preço decimal. Mostre uma frase com o nome do produto e o preço com duas casas decimais.

**Documentação oficial:** [Literais de texto formatados](https://docs.python.org/3/tutorial/inputoutput.html#formatted-string-literals)
