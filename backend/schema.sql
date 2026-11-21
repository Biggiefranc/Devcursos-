-- DevCursos+ | estrutura do banco compatível com MySQL 8 e TiDB Cloud
-- Alinhada ao código atual do Back-End (usuarios usa firebase_uid; não existe mais "senha").
-- Só estrutura, sem dados. Pode ser executado mais de uma vez (IF NOT EXISTS).

CREATE DATABASE IF NOT EXISTS dev_cursos CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE dev_cursos;

CREATE TABLE IF NOT EXISTS cursos (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(150) NOT NULL,
  descricao     TEXT,
  categoria     VARCHAR(100) DEFAULT NULL,
  nivel         VARCHAR(50)  DEFAULT NULL,
  duracao_horas DECIMAL(6,2) DEFAULT NULL,
  tecnologias   JSON DEFAULT NULL,
  projeto_final TEXT DEFAULT NULL,
  data_criacao  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS modulos (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  curso_id    INT UNSIGNED NOT NULL,
  titulo      VARCHAR(150) NOT NULL,
  descricao   TEXT,
  ordem       INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_modulos_curso (curso_id),
  CONSTRAINT fk_modulos_curso FOREIGN KEY (curso_id) REFERENCES cursos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS aulas (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  modulo_id     INT UNSIGNED NOT NULL,
  titulo        VARCHAR(150) NOT NULL,
  descricao     TEXT,
  conteudo      TEXT NOT NULL,
  video_url     VARCHAR(500) DEFAULT NULL,
  material_url  VARCHAR(500) DEFAULT NULL,
  duracao_minutos SMALLINT UNSIGNED DEFAULT NULL,
  ordem         INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_aulas_modulo (modulo_id),
  CONSTRAINT fk_aulas_modulo FOREIGN KEY (modulo_id) REFERENCES modulos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  firebase_uid  VARCHAR(128) NOT NULL,
  nome          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  data_criacao  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_firebase_uid (firebase_uid),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS progresso_aulas (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id     INT UNSIGNED NOT NULL,
  aula_id        INT UNSIGNED NOT NULL,
  concluida      TINYINT(1) NOT NULL DEFAULT 1,
  atualizada_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_progresso_usuario_aula (usuario_id, aula_id),
  KEY idx_progresso_aula (aula_id),
  CONSTRAINT fk_progresso_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_progresso_aula    FOREIGN KEY (aula_id)    REFERENCES aulas (id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS favoritos (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED NOT NULL,
  curso_id    INT UNSIGNED NOT NULL,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorito_usuario_curso (usuario_id, curso_id),
  KEY idx_favoritos_curso (curso_id),
  CONSTRAINT fk_favoritos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_favoritos_curso FOREIGN KEY (curso_id) REFERENCES cursos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS avaliacoes (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  curso_id        INT UNSIGNED NOT NULL,
  titulo          VARCHAR(150) NOT NULL DEFAULT 'Avaliação final',
  minimo_acertos  INT UNSIGNED NOT NULL DEFAULT 1,
  ativa           TINYINT(1) NOT NULL DEFAULT 1,
  criada_em       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_avaliacao_curso (curso_id),
  CONSTRAINT fk_avaliacao_curso FOREIGN KEY (curso_id) REFERENCES cursos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS questoes_avaliacao (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  avaliacao_id   INT UNSIGNED NOT NULL,
  enunciado      TEXT NOT NULL,
  ordem          INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_questoes_avaliacao (avaliacao_id, ordem),
  CONSTRAINT fk_questoes_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS alternativas_avaliacao (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  questao_id     INT UNSIGNED NOT NULL,
  texto          TEXT NOT NULL,
  correta        TINYINT(1) NOT NULL DEFAULT 0,
  ordem          INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_alternativas_questao (questao_id, ordem),
  CONSTRAINT fk_alternativas_questao FOREIGN KEY (questao_id) REFERENCES questoes_avaliacao (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS tentativas_avaliacao (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id       INT UNSIGNED NOT NULL,
  avaliacao_id     INT UNSIGNED NOT NULL,
  total_questoes   INT UNSIGNED NOT NULL,
  acertos          INT UNSIGNED NOT NULL,
  aprovada         TINYINT(1) NOT NULL DEFAULT 0,
  criada_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tentativas_usuario (usuario_id, criada_em),
  KEY idx_tentativas_avaliacao (avaliacao_id),
  CONSTRAINT fk_tentativa_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_tentativa_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS respostas_avaliacao (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tentativa_id      INT UNSIGNED NOT NULL,
  questao_id        INT UNSIGNED NOT NULL,
  alternativa_id    INT UNSIGNED NOT NULL,
  correta           TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_resposta_tentativa_questao (tentativa_id, questao_id),
  CONSTRAINT fk_resposta_tentativa FOREIGN KEY (tentativa_id) REFERENCES tentativas_avaliacao (id) ON DELETE CASCADE,
  CONSTRAINT fk_resposta_questao FOREIGN KEY (questao_id) REFERENCES questoes_avaliacao (id),
  CONSTRAINT fk_resposta_alternativa FOREIGN KEY (alternativa_id) REFERENCES alternativas_avaliacao (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
