---
titulo: Defina e chame uma função
descricao: Agrupe instruções relacionadas em uma função que possa ser chamada quando necessário.
ordem: 1
duracao: 12
video_url: null
material_url: null
---

# Dê um nome a uma tarefa

Uma função agrupa instruções com uma responsabilidade. `def` inicia sua definição; o corpo fica indentado. A função só executa quando é chamada.

```python
def mostrar_aviso():
    print("Lembre-se de salvar seu trabalho.")

mostrar_aviso()
mostrar_aviso()
```

A definição descreve o que fazer. As chamadas pedem que Python execute a tarefa. Isso evita copiar o mesmo bloco várias vezes e dá um nome útil a uma etapa do programa.

Escolha nomes que indiquem ações, como `mostrar_menu`, `calcular_total` ou `validar_nota`. Uma função deve ter um propósito que você consiga explicar numa frase.

## Pratique

Crie `mostrar_linha`, que escreve uma linha de separação, e chame-a antes e depois de um título. Depois crie uma função que mostra uma pergunta de boas-vindas.

**Documentação oficial:** [Definição de funções](https://docs.python.org/3/tutorial/controlflow.html#defining-functions)
