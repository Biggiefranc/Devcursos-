---
titulo: Como o Python é executado?
ordem: 8
video_url: "https://www.cursoemvideo.com/curso/python-3-mundo-1/?utm_source=chatgpt.com"
material_url: null
duracao: null
---

# Aula 8 - Como o Python é executado?

Até agora, conhecemos a origem do Python, sua evolução e algumas de suas principais características. Antes de começar a escrever programas maiores, é importante entender uma questão fundamental: **o que acontece quando executamos um programa Python?**
Quando escrevemos um programa, estamos utilizando uma linguagem que pode ser compreendida e processada pelo ambiente do Python. O computador, entretanto, não executa diretamente o código-fonte da mesma maneira que nós o escrevemos.
Para entender esse processo, precisamos conhecer alguns conceitos básicos.

## Código-fonte

O **código-fonte** é o conjunto de instruções escrito pelo programador em uma linguagem de programação.
Por exemplo:

```python
nome = "Maria"
print("Olá,", nome)
```

Esse código foi escrito em Python e pode ser salvo em um arquivo com a extensão `.py`.
Por exemplo:
`programa.py`
O arquivo contém as instruções que queremos que o Python execute.

## O interpretador Python

Para executar um programa Python, utilizamos o **interpretador Python**.
De maneira simplificada, podemos imaginar o processo da seguinte forma:
Código-fonte
     ↓
Interpretador Python
     ↓
Execução do programa
     ↓
Resultado
O interpretador é responsável por analisar as instruções escritas em Python e executar o programa de acordo com essas instruções.
É por isso que Python é tradicionalmente descrito como uma linguagem **interpretada**.
Entretanto, dizer simplesmente que "Python interpreta cada linha diretamente" é uma simplificação. O funcionamento interno é um pouco mais complexo.

## Python e o bytecode

Quando um programa Python é executado, o código-fonte pode ser convertido para uma representação intermediária chamada **bytecode**.
Esse bytecode é utilizado pela **Python Virtual Machine (PVM)**, ou Máquina Virtual Python.
De maneira simplificada:
Código Python
      ↓
Compilação para bytecode
      ↓
Bytecode
      ↓
Python Virtual Machine
      ↓
Execução
Essa explicação é uma forma simplificada de representar o processo. O funcionamento real possui outros detalhes, mas esse modelo é suficiente para compreender a ideia geral neste momento.
A documentação oficial explica que o Python pode compilar automaticamente o código para bytecode e que esse bytecode pode ser armazenado em arquivos `.pyc`, normalmente dentro de diretórios `__pycache__`.

## O que é o arquivo `.pyc`?

Durante a execução de programas Python, podemos encontrar arquivos com a extensão:
.pyc
Eles contêm **bytecode compilado**.
Por exemplo:
`programa.py`
pode resultar em um arquivo relacionado ao bytecode dentro de:
`pycache`
Esses arquivos não são normalmente escritos manualmente pelo programador.
Eles são utilizados pelo Python para otimizar determinadas etapas de execução e evitar que o código precise ser processado novamente em algumas situações.
É importante lembrar que `.pyc` **não é o programa original**. O código que escrevemos continua sendo o arquivo `.py`.

## Executando Python pelo terminal

Uma das formas mais simples de executar Python é utilizando o terminal.
Depois de instalar o Python, podemos verificar se ele está disponível utilizando:
python --version
Em alguns sistemas, especialmente Linux, o comando utilizado pode ser:
python3 --version
Se o Python estiver instalado, o terminal exibirá algo semelhante a:
Python 3.x.x
Também podemos executar um arquivo Python:
python programa.py
ou, em sistemas que utilizam `python3`:
python3 programa.py
Nesse caso, o interpretador recebe o arquivo `programa.py` e executa as instruções presentes nele.

## O modo interativo

Outra maneira de utilizar Python é através do **modo interativo**.
Quando executamos o interpretador sem fornecer um arquivo:
python
podemos receber um ambiente semelhante a:

```python
>>>
```

Esse símbolo indica que o Python está esperando uma instrução.
Podemos então escrever:

```python
>>> print("Olá, mundo!")
Olá, mundo!
```

O resultado aparece imediatamente.
O modo interativo é bastante útil para testar pequenos trechos de código, experimentar comandos e verificar rapidamente o comportamento de uma expressão.
Por exemplo:

```python
>>> 10 + 5
15
```

Não precisamos criar um arquivo `.py` para realizar esse teste.

## Arquivos `.py` e modo interativo

Podemos resumir as duas formas da seguinte maneira:

| **Forma**           | **Característica**                                                 |
| ------------------- | ------------------------------------------------------------------ |
| **Arquivo `.py`**   | Utilizado para criar e executar programas armazenados em arquivos. |
| **Modo interativo** | Permite executar instruções diretamente no interpretador.          |

Durante o aprendizado, as duas formas podem ser úteis.
O modo interativo é conveniente para pequenos testes, enquanto os arquivos `.py` são mais adequados para programas que precisam ser salvos, organizados e modificados posteriormente.

## Python em diferentes sistemas

Python pode ser utilizado em diferentes sistemas operacionais, como **Windows, Linux e macOS**.
Isso contribui para sua versatilidade, pois um programa Python pode, dependendo de suas características e dependências, ser executado em diferentes ambientes.
Naturalmente, podem existir diferenças relacionadas ao sistema operacional, bibliotecas instaladas ou configurações do ambiente.
Por isso, em projetos maiores, é importante controlar as dependências e o ambiente em que o programa será executado.

---

## Um exemplo completo

Considere o arquivo:
`saudacao.py`
Com o seguinte conteúdo:

```python
nome = input("Digite seu nome: ")
print("Olá,", nome)
```

Ao executar:

```pyyhon
python saudacao.py
```

o Python processará o programa e o usuário poderá interagir com ele:

```python
Digite seu nome: João
Olá, João
```

O importante neste momento é compreender o caminho geral:
`Arquivo .py`
     ↓
Python
     ↓
Processamento do código
     ↓
Execução
     ↓
Resultado
Nos próximos módulos, começaremos a escrever programas cada vez mais completos e veremos detalhadamente o que acontece em cada uma dessas instruções.

---

## Atenção

É comum encontrar explicações dizendo que Python "não é compilado, apenas interpretado".
Essa explicação é útil para uma primeira aproximação, mas **não descreve completamente o funcionamento do Python**.
Na implementação mais conhecida, o CPython, o código passa por uma etapa de compilação para bytecode antes de ser executado pela máquina virtual do Python.
Por isso, é mais correto compreender Python como uma linguagem cujo código é processado por um interpretador e, no caso do CPython, convertido para uma representação intermediária antes da execução.
Não é necessário decorar esses detalhes agora. O objetivo é apenas evitar uma explicação excessivamente simplificada que possa gerar confusão posteriormente.

---

## Vídeo recomendado

Para complementar esta aula, recomendamos o **Curso Python 3 – Mundo 1**, do professor Gustavo Guanabara.
[Python 3 – Mundo 1 — Curso em Vídeo](https://www.cursoemvideo.com/curso/python-3-mundo-1/?utm_source=chatgpt.com)
O curso apresenta a utilização prática do interpretador e a execução dos primeiros programas em Python.

---

## Material complementar

**Documentação oficial — Python**
[Documentação oficial do Python em português](https://docs.python.org/pt-br/3/?utm_source=chatgpt.com)
**Tutorial oficial — Interpretador Python**
[Usando o interpretador Python](https://docs.python.org/pt-br/3/tutorial/interpreter.html?utm_source=chatgpt.com)
**Documentação — Python FAQ**
Perguntas frequentes sobre Python
