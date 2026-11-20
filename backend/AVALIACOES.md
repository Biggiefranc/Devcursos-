# Configuração de avaliações por curso

O projeto possui agora a estrutura de persistência e os endpoints para avaliações finais. O conteúdo das questões não é incluído automaticamente porque o pacote original não contém um banco de questões confiável por curso.

## Regras implementadas

- Cada curso pode ter uma avaliação ativa (`avaliacoes.curso_id` é único).
- Cada avaliação contém questões em `questoes_avaliacao`.
- Cada questão precisa ter pelo menos duas alternativas em `alternativas_avaliacao`.
- Cada questão precisa ter exatamente uma alternativa marcada como correta (`correta = 1`).
- `minimo_acertos` deve ser um número entre 1 e o total de questões.
- O aluno só pode enviar uma tentativa depois de concluir todas as aulas do curso.
- O navegador recebe apenas o texto e o ID das alternativas. O gabarito não é enviado.
- O Back-End calcula a pontuação e registra a tentativa e as respostas dentro de uma transação.

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

Ambos exigem token Firebase válido e e-mail verificado. Não existe ainda painel administrativo para cadastrar/editar as questões; o cadastro é manual no banco.
