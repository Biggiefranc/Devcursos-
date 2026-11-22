---
titulo: "Projeto final: organizador de estudos no terminal"
descricao: Construa um menu de tarefas com funções, listas, dicionários, condições e repetições.
ordem: 4
duracao: 75
video_url: null
material_url: null
---

# Projeto: organize seus estudos

Crie um programa de terminal para cadastrar tarefas, listar tarefas, marcar uma tarefa como concluída e encerrar. Os dados ficam na memória enquanto o programa está aberto; fechar o programa encerra esta versão simples.

O código abaixo é uma base funcional. Execute primeiro, depois complete os desafios.

```python
tarefas = []

def listar_tarefas(tarefas):
    if len(tarefas) == 0:
        print("Nenhuma tarefa cadastrada.")
        return

    indice = 1
    for tarefa in tarefas:
        if tarefa["concluida"]:
            status = "concluída"
        else:
            status = "pendente"
        print(f"{indice}. {tarefa['titulo']} — {status}")
        indice = indice + 1

def concluir_tarefa(tarefas):
    listar_tarefas(tarefas)
    if len(tarefas) == 0:
        return

    try:
        numero = int(input("Número da tarefa: "))
    except ValueError:
        print("Digite um número inteiro.")
        return

    if numero < 1 or numero > len(tarefas):
        print("Esse número não existe.")
        return

    tarefas[numero - 1]["concluida"] = True

while True:
    print("1 - Adicionar  |  2 - Listar  |  3 - Concluir  |  0 - Sair")
    opcao = input("Escolha: ")

    if opcao == "1":
        titulo = input("Tarefa: ").strip()
        if titulo != "":
            tarefas.append({"titulo": titulo, "concluida": False})
    elif opcao == "2":
        listar_tarefas(tarefas)
    elif opcao == "3":
        concluir_tarefa(tarefas)
    elif opcao == "0":
        break
    else:
        print("Opção inválida.")
```

## Evolua o projeto

1. Teste cada opção, incluindo a lista vazia, uma escolha inválida e um número fora do intervalo.
2. Acrescente uma função `adicionar_tarefa` para separar a inclusão do menu.
3. Mostre quantas tarefas foram concluídas e quantas continuam pendentes.
4. Permita concluir novamente uma tarefa sem quebrar o programa.
5. Escreva no README como executar e quais recursos implementou.

## Entrega e revisão

Explique como o menu escolhe caminhos, onde a repetição termina, como a lista guarda registros e quais funções deixam o programa mais fácil de entender. Teste pelo menos cinco sequências de uso e registre uma melhoria que fez após encontrar um problema.

O próximo passo, fora do escopo deste projeto, seria guardar os dados em arquivo. Primeiro garanta que a versão em memória funciona.

**Documentação oficial:** [Funções](https://docs.python.org/3/tutorial/controlflow.html#defining-functions) · [Listas e dicionários](https://docs.python.org/3/tutorial/datastructures.html) · [Erros e exceções](https://docs.python.org/3/tutorial/errors.html)
