---
titulo: Envie informações para uma função
descricao: Use parâmetros e argumentos para reaproveitar uma tarefa com dados diferentes.
ordem: 2
duracao: 14
video_url: null
material_url: null
---

# Uma função pode receber dados

Um parâmetro é um nome usado na definição. Um argumento é o valor enviado quando chamamos a função.

```python
def mostrar_saudacao(nome):
    print(f"Olá, {nome}!")

mostrar_saudacao("Lia")
mostrar_saudacao("Ravi")
```

A função continua sendo a mesma; cada chamada entrega um valor diferente para `nome`. Uma função pode receber mais de um parâmetro:

```python
def mostrar_total(preco, quantidade):
    total = preco * quantidade
    print(f"Total: R$ {total:.2f}")

mostrar_total(7.5, 3)
```

A ordem dos argumentos corresponde à ordem dos parâmetros neste exemplo. Mais adiante, a documentação mostra argumentos nomeados e valores padrão; primeiro pratique chamadas simples e explícitas.

## Pratique

Escreva `mostrar_retangulo(largura, altura)`, que mostre a área. Chame-a com dois pares diferentes e confira o resultado.

**Documentação oficial:** [Mais sobre definição de funções](https://docs.python.org/3/tutorial/controlflow.html#more-on-defining-functions)
