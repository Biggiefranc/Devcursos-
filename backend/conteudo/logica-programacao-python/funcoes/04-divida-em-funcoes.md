---
titulo: Divida um problema em funções pequenas
descricao: Organize um programa separando entrada, cálculo e apresentação.
ordem: 4
duracao: 14
video_url: null
material_url: null
---

# Uma função por etapa compreensível

Quando uma função pergunta, calcula, valida e imprime tudo ao mesmo tempo, fica difícil descobrir onde está o problema. Separe tarefas que tenham responsabilidades distintas.

```python
def calcular_media(nota1, nota2):
    return (nota1 + nota2) / 2

def situacao_da_media(media):
    return media >= 7

def mostrar_resultado(nome, aprovado):
    if aprovado:
        print(f"{nome}: aprovado")
    else:
        print(f"{nome}: precisa estudar mais")

media = calcular_media(8, 6)
aprovado = situacao_da_media(media)
mostrar_resultado("Noa", aprovado)
```

Cada função tem um papel fácil de testar: calcular, decidir ou mostrar. O programa principal conecta os resultados. Não é necessário criar uma função para cada linha; divida quando um nome ajudar a explicar uma etapa.

## Pratique

Pegue o exercício de média da aula anterior. Separe o cálculo da mensagem. Troque as notas e confirme que a função de cálculo continua funcionando sem pedir entrada nem imprimir.

**Documentação oficial:** [Definição de funções](https://docs.python.org/3/tutorial/controlflow.html#defining-functions)
