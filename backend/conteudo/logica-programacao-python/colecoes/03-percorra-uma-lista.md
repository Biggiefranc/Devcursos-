---
titulo: Percorra todos os itens de uma lista
descricao: Use for para aplicar uma ação a cada valor armazenado.
ordem: 3
duracao: 13
video_url: null
material_url: null
---

# Um passo para cada item

Quando a sequência já contém os dados, `for` pode percorrê-los diretamente. Não é necessário contar índices se você só precisa do valor.

```python
materias = ["lógica", "redes", "Python"]

for materia in materias:
    print(f"Revisar: {materia}")
```

O bloco executa uma vez para cada item, na ordem da lista. A variável `materia` recebe temporariamente o item atual.

Para percorrer posições e valores ao mesmo tempo, há recursos como `enumerate`, mas primeiro acostume-se a ler cada item diretamente. O código fica mais simples quando não calcula índices sem necessidade.

## Pratique

Percorra uma lista de três nomes e mostre `Olá, nome`. Depois some manualmente os valores de uma lista curta usando um acumulador. Na próxima aula vamos fazer essa soma com uma coleção.

**Documentação oficial:** [Instruções for](https://docs.python.org/3/tutorial/controlflow.html#for-statements)
