---
titulo: Valide entradas com try e except
descricao: Recupere conversões inválidas sem esconder erros que você ainda precisa corrigir.
ordem: 2
duracao: 15
video_url: null
material_url: null
---

# Prepare-se para uma entrada inesperada

`int(input(...))` funciona quando a pessoa digita um inteiro. Se ela digitar palavras, Python gera `ValueError`. `try` e `except` permitem tratar esse caso conhecido e continuar o programa de forma clara.

```python
texto = input("Digite um número inteiro: ")

try:
    numero = int(texto)
except ValueError:
    print("Não consegui converter. Digite somente números inteiros.")
else:
    print(f"O dobro é {numero * 2}.")
```

O bloco `try` contém a operação que pode falhar. O `except ValueError` trata especificamente uma conversão inválida. O `else` executa quando não ocorreu essa exceção. Evite `except:` sem tipo: ele pode esconder erros que você precisa enxergar.

## Pratique

Peça uma idade inteira. Se a pessoa digitar texto, mostre uma mensagem clara. Se a conversão funcionar, mostre a idade no próximo aniversário. Teste `16` e `dezesseis`.

**Documentação oficial:** [Erros e exceções](https://docs.python.org/3/tutorial/errors.html) · [ValueError](https://docs.python.org/3/library/exceptions.html#ValueError)
