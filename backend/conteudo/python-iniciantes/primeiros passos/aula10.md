---
titulo: Indentação
ordem: 10
video_url: "https://www.cursoemvideo.com/curso/python-3-mundo-1/?utm_source=chatgpt.com"
material_url: null
duracao: null
---

# Aula 10 - Indentação

Chegamos à última aula do primeiro módulo.
Até aqui, conhecemos o que é programação, entendemos o que é Python, vimos um pouco de sua história e evolução, conhecemos algumas de suas principais características e começamos a observar como um programa Python é escrito e organizado.
Agora vamos estudar uma característica que merece uma atenção especial: **a indentação**.
Se você já observou algum código Python, provavelmente percebeu que algumas linhas aparecem mais afastadas da margem do que outras.
Isso não acontece apenas para deixar o código bonito.
Em Python, **a indentação faz parte da estrutura do programa**.

---

# O que é indentação?

Indentação é o **espaçamento utilizado no início de uma linha de código para indicar que ela pertence a determinado bloco**.
Observe:

```
if idade >= 18:
    print("Você é maior de idade.")
A linha:
print("Você é maior de idade.")
```

está recuada em relação ao `if`.
Esse recuo indica que a instrução pertence ao bloco iniciado pelo `if`.
Podemos visualizar a estrutura assim:

```
if idade >= 18:
│
└── print("Você é maior de idade.")
```

A indentação, portanto, ajuda o Python a entender **quais instruções fazem parte de determinada estrutura**.
A documentação e o material-base destacam justamente essa característica: em Python, a indentação não é apenas uma questão estética, pois ela determina a estrutura dos blocos de código.

---

# Por que Python utiliza indentação?

Em outras linguagens de programação, é comum encontrar símbolos específicos para delimitar blocos de código.
Por exemplo, algumas linguagens utilizam estruturas semelhantes a:

```
{
    instrução;
    instrução;
}
```

Python escolheu uma abordagem diferente.
Em vez de utilizar esses delimitadores para indicar visualmente onde um bloco começa e termina, a linguagem utiliza **o nível de indentação**.
Isso faz com que a organização visual do código tenha uma relação direta com sua estrutura.
Observe:

```
if idade >= 18:
    print("Maior de idade")
    print("Pode continuar.")
```

As duas chamadas de `print()` possuem o mesmo nível de indentação.
Isso significa que as duas pertencem ao bloco do `if`.
Podemos representar:

```
if
│
├── print("Maior de idade")
│
└── print("Pode continuar.")
```

Essa característica pode parecer estranha no começo, principalmente para quem está acostumado com outras linguagens.
Depois de algum tempo, porém, ela se torna bastante natural.

---

# Um exemplo mais completo

Considere:

```
idade = 20

if idade >= 18:
    print("Você é maior de idade.")
    print("Pode continuar.")
```

Primeiro temos:

```
idade = 20
```

Depois temos uma estrutura condicional:

```
if idade >= 18
```

E, abaixo dela, temos duas instruções indentadas:

```
   print("Você é maior de idade.")
    print("Pode continuar.")
```

Essas duas instruções pertencem ao bloco do `if`.
O programa pode ser visualizado assim:

```
idade = 20

if idade >= 18:
│
├── print("Você é maior de idade.")
│
└── print("Pode continuar.")
```

A indentação torna essa relação bastante clara tanto para o interpretador quanto para quem está lendo o código.

---

# E se a indentação estiver errada?

Aqui está uma das coisas mais importantes sobre Python.
Observe:

```
idade = 20

if idade >= 18:
print("Você é maior de idade.")
```

O `print()` deveria estar dentro do bloco do `if`, mas não está indentado.
Python não pode simplesmente ignorar essa diferença.
Dependendo da situação, o interpretador apresentará um erro, como um `IndentationError`.
Esse tipo de erro indica que existe um problema relacionado à organização do código.
Por isso, quando começamos a programar em Python, precisamos prestar atenção ao alinhamento das linhas.

---

# A indentação precisa ser consistente

Não basta simplesmente colocar algum espaço antes de uma linha.
As instruções pertencentes ao mesmo bloco precisam utilizar **um nível de indentação consistente**.
Por exemplo:

```
if idade >= 18:
    print("Maior de idade")
    print("Pode continuar.")
```

As duas instruções estão no mesmo nível.
Agora imagine:

```
if idade >= 18:
    print("Maior de idade")
        print("Pode continuar.")
```

A segunda instrução possui um nível de recuo diferente da primeira sem que exista uma nova estrutura justificando isso.
Esse tipo de organização pode gerar um erro.
A ideia fundamental é:

> **Linhas que pertencem ao mesmo bloco devem possuir o mesmo nível de indentação.**

---

# Espaços ou tabulação?

Python permite utilizar espaços ou tabulações para realizar a indentação, mas é importante **não misturar os dois de maneira inconsistente**.
Atualmente, a convenção mais comum é utilizar **4 espaços por nível de indentação**.
Por exemplo:

```
if idade >= 18:
    print("Maior de idade")
```

Aqui existem quatro espaços antes de `print()`.
Se tivermos um bloco dentro de outro:

```
if idade >= 18:
    if idade >= 60:
        print("Pessoa idosa")
```

Podemos visualizar:

```
if idade >= 18:
│
└── if idade >= 60:
    │
    └── print("Pessoa idosa")
```

Cada nível acrescenta um novo nível de indentação.
A própria documentação oficial recomenda utilizar **4 espaços por nível de indentação** e orienta evitar misturar tabulações e espaços.

---

# Indentação e blocos

A importância da indentação fica ainda mais evidente quando estudamos estruturas que possuem blocos.
Por exemplo, funções:

```
def saudacao():
    print("Olá!")
    print("Seja bem-vindo.")
```

As duas instruções estão indentadas porque pertencem ao corpo da função.
Podemos representar:

```
def saudacao():
│
├── print("Olá!")
│
└── print("Seja bem-vindo.")
```

Mais tarde, estudaremos funções com muito mais profundidade.
Por enquanto, o objetivo é apenas perceber como a indentação representa a relação entre uma estrutura e suas instruções internas.

---

# Indentação em estruturas de repetição

O mesmo acontece com estruturas de repetição.
Por exemplo:

```
for numero in range(5):
    print(numero)
```

O `print()` está dentro do bloco do `for`.
Podemos imaginar:

```
for
│
└── print(numero)
```

Novamente, não é necessário compreender ainda todos os detalhes de `for` ou `range()`.
O exemplo está sendo utilizado apenas para mostrar que **diferentes estruturas da linguagem utilizam blocos de código, e esses blocos são representados pela indentação**.

---

# Um exemplo com vários níveis

Agora podemos observar uma estrutura um pouco maior:

```
idade = 20

if idade >= 18:
    print("Maior de idade.")

    if idade >= 60:
        print("Também possui 60 anos ou mais.")
```

Aqui temos diferentes níveis:

```
if idade >= 18:
│
├── print("Maior de idade.")
│
└── if idade >= 60:
    │
    └── print("Também possui 60 anos ou mais.")
```

Observe que o segundo `if` está dentro do primeiro.
Consequentemente, o `print()` relacionado ao segundo `if` possui um nível de indentação ainda maior.
Essa organização permite enxergar visualmente a hierarquia do programa.

---

# A indentação melhora a leitura

Apesar de a indentação possuir uma função sintática em Python, ela também traz uma vantagem muito importante: **torna a estrutura do código bastante fácil de visualizar**.
Considere:

```
if usuario_logado:
    if administrador:
        print("Acesso administrativo")
    else:
        print("Acesso comum")
else:
    print("Faça login")
```

Mesmo sem analisar detalhadamente a lógica do programa, conseguimos observar que:

- existe uma primeira condição;
- dentro dela existe outra condição;
- existem diferentes caminhos possíveis;
- cada instrução está associada ao bloco correspondente.

A própria aparência do código ajuda a compreender sua organização.
Essa é uma das características que contribuem para a reputação do Python como uma linguagem de código relativamente legível.

---

# Indentação não é simplesmente estética

É importante reforçar esse ponto.
Em algumas linguagens, podemos escrever:

```
if (condição) {
    instrução;
}
```

e depois modificar os espaços e quebras de linha sem necessariamente alterar o significado do programa.
Em Python, isso não funciona da mesma maneira.
O recuo pode alterar a estrutura do código.
Por exemplo:

```
if condicao:
    print("A")
    print("B")
é diferente de:
if condicao:
    print("A")

print("B")
```

No primeiro caso, as duas instruções pertencem ao `if`.
No segundo, apenas `"A"` pertence ao `if`; `"B"` está fora do bloco.
Essa diferença pode mudar completamente o comportamento do programa.

---

# Um erro bastante comum para iniciantes

Imagine que alguém escreva:

```
if nota >= 7:
    print("Aprovado")
        print("Parabéns!")
```

É fácil perceber que algo está errado.
O segundo `print()` está mais recuado que o primeiro, mas não existe nenhuma nova estrutura justificando esse recuo.
Um iniciante pode pensar:

> "Quanto mais espaço eu colocar, mais dentro do `if` ele fica."

Não é assim.
A indentação não funciona como uma escala livre de espaços.
Ela representa **níveis de blocos**.
Por isso, quando duas instruções pertencem ao mesmo bloco, elas devem permanecer alinhadas:

```
if nota >= 7:
    print("Aprovado")
    print("Parabéns!")
```

---

# Como os editores ajudam?

Na prática, não precisamos contar manualmente cada espaço.
Editores de código e IDEs normalmente ajudam a manter a indentação correta.
Ao pressionar `Enter` depois de uma estrutura como:

```
if idade >= 18:
o editor pode automaticamente colocar o cursor no nível correto:
if idade >= 18:
    |
```

Da mesma forma, ao sair de um bloco, podemos diminuir a indentação.
Mesmo assim, é importante entender o conceito.
Não adianta o editor organizar o código automaticamente se o programador não sabe **por que aquela linha está sendo indentada**.

---

# Indentação e Python

A indentação é uma das características que mais diferenciam Python de muitas outras linguagens.
Ela pode parecer apenas uma escolha de estilo quando observamos o código pela primeira vez:

```
if condicao:
    print("Olá")
```

Mas, na realidade, o recuo está indicando uma relação estrutural.
O Python utiliza essa característica para tornar os blocos de código visualmente claros.
A documentação oficial explica que o uso de indentação significativa faz parte da própria sintaxe da linguagem.
Isso também ajuda a evitar um problema comum em projetos de outras linguagens: código em que a estrutura real está escondida por uma organização visual ruim.
Em Python, se o código estiver mal indentado, o problema tende a ficar evidente — e muitas vezes o próprio interpretador impedirá sua execução.

---

# Boas práticas

Ao escrever Python, algumas práticas simples ajudam bastante:

### Utilize uma indentação consistente

A convenção mais utilizada é:

```
4 espaços = 1 nível
```

### Não misture espaços e tabulações

Escolha uma forma de indentação e mantenha-a consistente.

### Mantenha blocos visualmente organizados

Por exemplo:

```
if usuario:
    print("Usuário encontrado")
    print("Carregando informações...")
```

### Utilize um editor que ajude com a indentação

Isso reduz erros durante a escrita.

### Não tente corrigir erros apenas adicionando espaços

Quando surgir um `IndentationError`, procure entender **qual bloco aquela linha deveria pertencer**.
Essa última prática é especialmente importante.
Programar não é simplesmente fazer o código "parar de reclamar". É entender a estrutura que queremos representar e escrevê-la corretamente.

---

# Exercício de observação

Observe o código abaixo:

```
nome = "Ana"

if nome == "Ana":
    print("Nome encontrado")
    print("Bem-vinda!")
```

Agora tente responder:
**1. Quantos blocos de código existem?**
Temos um bloco associado ao `if`.
**2. Quais instruções pertencem a esse bloco?**
As duas chamadas de `print()`.
**3. Por que elas possuem o mesmo nível de indentação?**
Porque pertencem ao mesmo bloco.
Agora observe:

```
nome = "Ana"

if nome == "Ana":
    print("Nome encontrado")

print("Fim do programa")
```

Aqui, `print("Fim do programa")` está fora do bloco do `if`.
A diferença é pequena visualmente, mas importante estruturalmente.
Esse tipo de observação será fundamental quando começarmos a escrever programas com decisões e repetições.

---

# O que aprendemos neste módulo?

Com esta aula, encerramos o primeiro módulo do curso.
Ao longo dele, começamos do mais básico e fomos gradualmente chegando à estrutura da linguagem.
Passamos por:

### 1. Programação e linguagens

Entendemos o que significa programar e qual é o papel de uma linguagem de programação.

### 2. O que é Python?

Conhecemos Python e sua proposta.

### 3. História e origem

Vimos como a linguagem surgiu e como evoluiu.

### 4. Origem do nome

Conhecemos a origem do nome Python.

### 5. Evolução das versões

Observamos que Python passou por diferentes versões ao longo de sua história.

### 6. Python 2 e Python 3

Entendemos por que Python 3 é a referência utilizada atualmente.

### 7. Características fundamentais

Conhecemos aspectos como legibilidade, tipagem dinâmica, multiparadigma e seu ecossistema.

### 8. Como Python é executado?

Vimos a relação entre código-fonte, interpretador, bytecode e execução.

### 9. Sintaxe e estrutura

Começamos a compreender como diferentes elementos são organizados para formar um programa.

### 10. Indentação

Por fim, entendemos que o recuo do código Python não é apenas visual: ele participa da estrutura dos blocos.

---

# E agora?

Até aqui, nosso objetivo foi **conhecer a linguagem**.
A partir do próximo módulo, a proposta muda.
Vamos começar efetivamente a **programar**.
Será nesse momento que estudaremos conceitos como:

- algoritmos;
- variáveis;
- constantes;
- tipos de dados;
- operadores;
- entrada e saída de dados;
- estruturas condicionais;
- estruturas de repetição;
- funções;
- escopo;
- organização de programas.

Em vez de apenas explicar o que Python é, começaremos a utilizar Python para **resolver problemas**.
Essa mudança é importante.
Conhecer a linguagem é apenas o primeiro passo. O verdadeiro aprendizado acontece quando conseguimos pegar um problema, pensar em uma solução e transformar essa solução em código.

---

## Vídeo recomendado

Para complementar esta aula e revisar os conceitos iniciais de Python, recomendamos novamente o conteúdo do **Curso em Vídeo**, do professor Gustavo Guanabara.
[Python 3 – Mundo 1 — Curso em Vídeo](https://www.cursoemvideo.com/curso/python-3-mundo-1/?utm_source=chatgpt.com)
A recomendação é acompanhar os exemplos escrevendo o código junto com a aula. Não fique apenas assistindo: **digite, execute, erre e tente corrigir**.
Essa prática será cada vez mais importante a partir do próximo módulo.

---

## Material complementar

**Documentação oficial do Python — Indentação**
[Documentação oficial do Python — Estrutura e indentação](https://docs.python.org/pt-br/3/reference/lexical_analysis.html?utm_source=chatgpt.com#indentation)
**Tutorial oficial do Python**
[Tutorial do Python — documentação oficial](https://docs.python.org/pt-br/3/tutorial/?utm_source=chatgpt.com)

---

> **Resumo da aula:** em Python, a indentação é parte da sintaxe da linguagem. Ela indica a organização dos blocos de código e determina quais instruções pertencem a determinadas estruturas. Por isso, manter uma indentação consistente não é apenas uma questão de estética: é necessário para que o programa tenha a estrutura correta.

### Encerramento do Módulo 1

**Você agora conhece a linguagem.**
No próximo módulo, vamos começar a **programar de verdade**.
