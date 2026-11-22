---
titulo: Entenda onde uma variável existe
descricao: Reconheça variáveis locais criadas dentro de uma função.
ordem: 5
duracao: 10
video_url: null
material_url: null
---

# Nomes locais ajudam a evitar surpresas

Uma variável criada dentro de uma função normalmente é local a ela. Isso permite que duas funções usem nomes parecidos sem compartilhar acidentalmente o mesmo valor.

```python
def calcular_total(preco, quantidade):
    total = preco * quantidade
    return total

resultado = calcular_total(5, 3)
print(resultado)
```

`total` é criado durante a chamada da função. Fora dela, usamos o que a função retornou em `resultado`. Se tentar acessar `total` fora, Python informa que esse nome não foi definido naquele escopo.

Passe dados necessários como parâmetros e devolva resultados com `return`. Isso torna a função mais previsível do que depender de muitas variáveis espalhadas pelo programa.

## Pratique

Crie duas funções, cada uma com um parâmetro chamado `valor`, e veja que cada uma pode operar sobre seu próprio parâmetro. Explique por que passar valores torna a função mais fácil de testar.

**Documentação oficial:** [Escopos e namespaces](https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces)
