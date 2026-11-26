---
titulo: Entrada, processamento e saída
descricao: Leia uma resposta com input, transforme-a em um dado e apresente um resultado.
ordem: 4
duracao: 25
video_url: null
material_url: null
---

## Deixe o programa receber uma resposta

Nos exemplos anteriores, você precisava editar o código para trocar os dados. Um balcão de atendimento funciona de outro jeito. A mesma pessoa pode pedir o nome de Lia ou de Ravi e usar a resposta que ouviu. Em Python, `input()` lê uma linha da entrada e devolve o que chegou como texto.

```python
nome = input()
print("Olá, " + nome + "!")
```

Na primeira linha, o lado direito é executado primeiro. `input()` lê uma linha e o sinal `=` associa a resposta ao nome `nome`. Na segunda, `+` junta os trechos de texto na ordem em que aparecem. O espaço em `"Olá, "` separa a vírgula do nome. `print` escreve a frase pronta. Uma execução com `Lia` produz `Olá, Lia!`.

### Onde digitar a entrada

No terminal do computador, um programa com `input()` aguarda uma linha digitada. No DevCursos+, abra **Entrada (stdin)**, escreva a resposta e clique em **Executar código**. Cada chamada de `input()` consome uma linha, começando pela primeira. Se quiser testar de novo com outro nome, edite a entrada e execute o mesmo código.

No terminal, você também pode escrever `input("Seu nome: ")`. O texto entre parênteses aparece antes da leitura. Nos exercícios que comparam a saída exata, prefira `input()` quando o enunciado pedir só a resposta final. Assim nenhuma pergunta extra entra na saída avaliada.

## Faça três experiências

**Uma resposta, duas execuções.** Rode o exemplo com `Lia` e depois com `Ravi`. A saudação deve trocar de nome nas duas execuções sem você tocar no código. Troque `nome` por `"nome"` dentro de `print` e veja por que a frase deixa de usar a entrada. Corrija antes de seguir.

**Duas respostas numa só execução.** Use este código e digite `Lia` na primeira linha da entrada e `Recife` na segunda.

```python
nome = input()
cidade = input()
print(nome + " estuda em " + cidade + ".")
```

A saída esperada é `Lia estuda em Recife.`. Troque a ordem das linhas no campo de entrada e observe qual nome recebe cada texto. Depois remova a segunda linha e rode de novo. Se aparecer `EOFError`, faltou uma entrada para o segundo `input()`.

**O mesmo sinal, dois usos.** Execute `print("2" + "3")` e `print(2 + 3)`, um abaixo do outro. A primeira linha mostra `23` porque junta texto. A segunda mostra `5` porque soma números. Quando você digita `2` em `input()`, Python recebe o texto `"2"`. Vamos converter entradas em números no próximo módulo.

Na prática com verificação, monte a saudação que o enunciado pede. Execute com um nome seu e confira os espaços e a exclamação. A verificação testa outros nomes automaticamente.
