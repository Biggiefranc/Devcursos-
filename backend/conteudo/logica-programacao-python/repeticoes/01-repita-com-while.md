---
titulo: Repita instruções com while
descricao: Use uma condição para repetir um bloco enquanto o trabalho ainda não terminou.
ordem: 1
duracao: 12
video_url: null
material_url: null
---

# Repita enquanto uma condição for verdadeira

Um laço `while` executa seu bloco enquanto a condição for verdadeira. A condição precisa poder mudar; senão, o programa pode repetir para sempre.

```python
contador = 1

while contador <= 3:
    print(f"Tentativa {contador}")
    contador = contador + 1

print("Fim")
```

O contador começa em 1. Depois de cada repetição ele aumenta. Quando chega a 4, `contador <= 3` é falso e o laço termina.

Antes de executar um `while`, identifique três coisas: valor inicial, condição de parada e atualização do estado. Se faltar a atualização, confira se existe outra maneira de a condição se tornar falsa.

## Pratique

Altere o exemplo para contar de 5 até 1 e mostrar `Começar!` no fim. A cada repetição, diminua o contador.

**Documentação oficial:** [A instrução while](https://docs.python.org/3/reference/compound_stmts.html#the-while-statement)
