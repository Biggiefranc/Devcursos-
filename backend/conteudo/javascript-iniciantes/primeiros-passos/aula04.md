---
titulo: Exemplo de condicional e blocos
descricao: Veja como if e else executam blocos diferentes conforme uma condição.
ordem: 4
video_url: null
material_url: null
duracao: null
---

# Exemplo de condicional e blocos

Uma condicional permite executar instruções diferentes conforme o resultado de uma expressão.

## Exemplo

```javascript
const idade = 17;

if (idade >= 18) {
    console.log("Maior de idade");
    console.log("Pode tirar a habilitação");
} else {
    console.log("Menor de idade");
}

console.log("Fim do programa");
```

## Como funciona?

1. A variável `idade` recebe o valor `17`.
2. A condição `idade >= 18` é avaliada.
3. Como a condição é falsa, o bloco do `else` é executado.
4. A última mensagem é exibida porque está fora da condicional.

## Experimente

Altere o valor de `idade` para `20` e execute o código novamente. Observe quais mensagens aparecem.

## Resumo

O `if` permite testar uma condição. O `else` define o bloco alternativo quando a condição não é verdadeira.
