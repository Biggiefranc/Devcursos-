---
titulo: Leia a mensagem de erro sem entrar em pânico
descricao: Diferencie erros de sintaxe e erros durante a execução.
ordem: 1
duracao: 15
video_url: null
material_url: null
---

# Erro é uma pista

Dois grupos comuns de problemas são erros de sintaxe e exceções. Um erro de sintaxe impede Python de interpretar uma instrução. Uma exceção acontece quando o programa está executando e encontra uma operação inválida.

```python
# SyntaxError: falta o dois-pontos
if idade >= 18
    print("Maior de idade")
```

```python
# NameError: o nome não foi definido
print(total)
```

Leia o final da mensagem, que geralmente indica o tipo e a descrição do erro. Depois observe o arquivo e a linha apontados. A causa pode estar um pouco antes do local destacado.

Erros como `NameError`, `TypeError`, `ValueError`, `IndexError` e `ZeroDivisionError` indicam problemas diferentes. Em vez de decorar tudo, compare a operação com o valor recebido e leia a mensagem completa.

## Pratique

Execute um exemplo por vez com um nome escrito errado e com uma soma entre texto e número. Anote o tipo de erro e corrija a causa. Não apague partes ao acaso.

**Documentação oficial:** [Erros e exceções](https://docs.python.org/3/tutorial/errors.html)
