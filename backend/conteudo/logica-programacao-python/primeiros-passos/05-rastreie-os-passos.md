---
titulo: Rastreie os passos de um algoritmo
descricao: Acompanhe como cada instrução altera os valores usados pelo programa.
ordem: 5
duracao: 23
video_url: null
material_url: null
---

## Descubra em qual linha o valor mudou

Imagine que você anotou quantas páginas leu. Começou com 8. Depois leu mais 5 e, à noite, releu 2. Para saber o total, é mais seguro anotar o que mudou em cada etapa do que tentar lembrar de tudo no final.

Fazer o mesmo com um programa é **rastrear a execução**. Você lê uma instrução de cada vez e escreve o valor de cada variável que interessa. Isso permite dizer onde começou uma diferença entre a sua previsão e o que saiu no editor.

```python
paginas = 8
paginas = paginas + 5
revisao = 2
paginas = paginas + revisao
print(paginas)
```

Em `paginas = paginas + 5`, o `paginas` da direita ainda vale `8`. Python calcula `8 + 5` e só então associa `13` ao nome que está à esquerda. Nessa instrução, o sinal `=` faz uma atribuição. Na linha seguinte, `revisao` recebe seu próprio valor.

Copie o rascunho abaixo e anote os valores antes de olhar a saída do programa. O traço indica um nome que ainda não recebeu valor.

```text
Depois da linha 1    paginas: 8     revisao: —
Depois da linha 2    paginas: 13    revisao: —
Depois da linha 3    paginas: 13    revisao: 2
Depois da linha 4    paginas: 15    revisao: 2
```

A última linha só mostra `15`. Ela não altera nenhuma dessas variáveis.

## Faça o rastreamento antes de rodar

1. **Mude a revisão.** Substitua `revisao = 2` por `revisao = 0`. Anote a primeira linha em que seu rascunho muda e preveja a saída. Execute para confirmar `13`.
2. **Troque uma atualização por uma atribuição direta.** No código original, substitua `paginas = paginas + revisao` por `paginas = revisao`. Preveja o novo valor de `paginas`. O programa mostra `2`. Ele pega o valor de `revisao` e deixa de lado a conta com o total anterior.
3. **Investigue uma diferença.** Se você esperava `15` e viu `2`, adicione temporariamente `print(paginas)` entre a segunda e a terceira linha. Agora a saída tem `13` e `2`. Isso mostra que o cálculo da manhã ainda estava certo e que a mudança aconteceu depois. Remova o `print` temporário.

## Prática com verificação

Você vai atualizar uma pontuação que começa em 4, recebe mais 3 e depois dobra. Anote os três valores que `pontos` vai ter. Complete as linhas que faltam no editor e deixe uma única saída com o resultado final. Se o resultado sair diferente, use um `print` temporário para descobrir a primeira linha que divergiu do seu rascunho.
