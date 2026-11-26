# Configuração de avaliações por curso

O projeto possui estrutura de persistência e endpoints para avaliações finais. As questões ficam versionadas junto aos materiais em `backend/conteudo/<curso>/avaliacao.json`; cursos sem esse arquivo ainda não têm avaliação configurada.

## Regras implementadas

- Cada curso pode ter uma avaliação ativa (`avaliacoes.curso_id` é único).
- Cada avaliação contém questões em `questoes_avaliacao`.
- Cada questão precisa ter pelo menos duas alternativas em `alternativas_avaliacao`.
- Cada questão precisa ter exatamente uma alternativa marcada como correta (`correta = 1`).
- `minimo_acertos` deve ser um número entre 1 e o total de questões.
- O aluno só pode enviar uma tentativa depois de concluir todas as aulas do curso.
- O navegador recebe apenas o texto e o ID das alternativas. O gabarito não é enviado.
- O Back-End calcula a pontuação e registra a tentativa e as respostas dentro de uma transação.
- As avaliações de módulo dão feedback por questão. As finais retornam apenas a nota e a aprovação, sem indicar os erros por questão.
- As tentativas de avaliação têm limite de 10 por conta a cada 15 minutos. Se uma avaliação final for usada para certificar proficiência, mantenha o banco de questões e o gabarito em uma fonte privada. Quem tem acesso aos JSONs versionados pode consultar as respostas desses exercícios.

## Cadastro manual de uma avaliação

Execute `schema.sql` primeiro. Em seguida, use um cliente MySQL/TiDB para cadastrar a avaliação, questões e alternativas. O exemplo abaixo é um **modelo de comandos**, não conteúdo didático pronto; substitua os IDs, enunciados e alternativas pelo material revisado do seu curso.

```sql
-- 1) Crie uma avaliação para um curso existente.
INSERT INTO avaliacoes (curso_id, titulo, minimo_acertos, ativa)
VALUES (<ID_DO_CURSO>, 'Avaliação final', <MINIMO_DE_ACERTOS>, 1);
SET @avaliacao_id = LAST_INSERT_ID();

-- 2) Crie uma questão e capture seu ID.
INSERT INTO questoes_avaliacao (avaliacao_id, enunciado, ordem)
VALUES (@avaliacao_id, '<ENUNCIADO_DA_QUESTAO>', 1);
SET @questao_id = LAST_INSERT_ID();

-- 3) Cadastre pelo menos duas alternativas; marque exatamente uma como correta.
INSERT INTO alternativas_avaliacao (questao_id, texto, correta, ordem)
VALUES
  (@questao_id, '<ALTERNATIVA_A>', 1, 1),
  (@questao_id, '<ALTERNATIVA_B>', 0, 2);
```

Repita os passos 2 e 3 para cada questão. Não execute o modelo com os marcadores `<...>` sem substituí-los por dados válidos.

## Endpoints do aluno

- `GET /cursos/:cursoId/avaliacao`: retorna a avaliação e as alternativas públicas, sem revelar a alternativa correta.
- `POST /avaliacoes/:id/tentativas`: recebe `{ "respostas": [{ "questaoId": 1, "alternativaId": 2 }] }`, verifica a conclusão das aulas, corrige no servidor e retorna o resultado da tentativa.

Ambos exigem token Firebase válido e e-mail verificado. Ainda não há painel administrativo para cadastrar ou editar questões; o cadastro pode ser feito no banco ou sincronizado por arquivo JSON, conforme a seção abaixo.

## Importar avaliações versionadas em arquivo

Para cadastrar uma avaliação a partir do conteúdo do repositório, coloque um `avaliacao.json` dentro da pasta do curso, ao lado de `curso.md`. O arquivo deve conter `titulo`, `minimo_acertos`, `ativa` e `questoes`; cada questão contém `enunciado` e pelo menos duas alternativas, com exatamente uma alternativa `correta: true`.

Depois de importar primeiro os cursos e as aulas, execute:

```bash
npm --prefix backend run import:avaliacoes
```

O script sincroniza as questões em uma transação. Se a avaliação já tiver tentativas registradas, ele preserva as questões existentes para não invalidar respostas e resultados anteriores.
