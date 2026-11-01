USE dev_cursos;

-- Adiciona o id do usuário do Firebase na tabela de usuários
ALTER TABLE usuarios
ADD COLUMN firebase_uid VARCHAR(255) UNIQUE
CHARACTER SET ascii 
COLLATE ascii_bin 
NULL AFTER id;

-- Permite que novos usuários não tenham a senha definida, pois a autenticação será feita pelo Firebase
ALTER TABLE usuarios
MODIFY COLUMN senha VARCHAR(255) NULL;

-- Confirma que cada uid só pode ser associado a um usuário
CREATE UNIQUE INDEX uq_usuarios_firebase_uid
ON usuarios (firebase_uid);