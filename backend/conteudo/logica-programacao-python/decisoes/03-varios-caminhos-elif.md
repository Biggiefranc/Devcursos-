---
titulo: Escolha entre vários caminhos com elif
descricao: Encadeie condições para tratar faixas e categorias sem repetir decisões.
ordem: 3
duracao: 12
video_url: null
material_url: null
---

# Mais de duas possibilidades

Use `elif` quando existirem várias categorias. Python testa as condições de cima para baixo e executa o primeiro bloco verdadeiro. Se nenhuma for verdadeira, pode executar o `else`.

```python
nota = float(input("Nota de 0 a 10: "))

if nota >= 9:
    conceito = "Excelente"
elif nota >= 7:
    conceito = "Aprovado"
elif nota >= 5:
    conceito = "Recuperação"
else:
    conceito = "Precisa revisar"

print(conceito)
```

A ordem importa: `nota >= 9` também seria verdadeira para uma nota acima de 7. Colocar primeiro a faixa mais alta evita que ela seja capturada por uma condição mais ampla.

Este exemplo ainda aceita notas negativas e acima de 10. Na aula de validação, vamos incluir os limites.

## Pratique

Crie categorias de tempo de estudo: até 30 minutos, de 31 a 60, e acima de 60. Teste exatamente `30`, `31` e `60`.

**Documentação oficial:** [Instruções if e elif](https://docs.python.org/3/tutorial/controlflow.html#if-statements)
