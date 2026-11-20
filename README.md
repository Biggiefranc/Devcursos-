# DevCursos+

Plataforma de cursos com Front-End em Vite/JavaScript, API Node.js/Express, Firebase Authentication e MySQL/TiDB.

## Requisitos

- Node.js 20.19+ (recomendado) e npm.
- Um projeto Firebase com Email/Password e Google Sign-In habilitados.
- Um banco MySQL 8 ou TiDB Cloud.

## Configuração local

1. Instale as dependências em `Back-End` e `Front-End`, executando `npm install` dentro de cada pasta. A raiz não possui dependências próprias.
2. Copie `Back-End/.env.example` para `Back-End/.env` e ajuste o acesso ao banco. Para TiDB Cloud, normalmente use a porta `4000` e `DB_SSL=true`; para MySQL local, o padrão costuma ser `3306` e `DB_SSL=false`. O `Back-End/src/config/env.js` carrega esse arquivo.
3. Para desenvolvimento local sem Firebase Admin configurado, mantenha `NODE_ENV=development` e `FIREBASE_AUTH_MODE=bypass` no `.env`. Esse modo usa uma identidade local fixa e **não é autenticação real**. Nunca use bypass em produção. Para produção, use `NODE_ENV=production`, `FIREBASE_AUTH_MODE=strict` e configure `GOOGLE_APPLICATION_CREDENTIALS` para uma credencial do Firebase Admin.
4. Copie `Front-End/.env.example` para `Front-End/.env`. Ajuste `VITE_API_URL` somente se a API não estiver em `http://localhost:3001`.
5. Confira se `DB_NAME` corresponde ao nome `dev_cursos` usado no início de `Back-End/schema.sql` (ou ajuste o `CREATE DATABASE`/`USE` do arquivo) e execute o SQL no banco configurado. O arquivo contém as tabelas base, favoritos e a estrutura de avaliações/tentativas. Consulte `Back-End/AVALIACOES.md` para cadastrar manualmente questões.
6. Importe/sincronize o conteúdo Markdown com `npm --prefix Back-End run import`. A importação agora atualiza cursos/módulos/aulas com título correspondente em vez de inserir duplicatas a cada execução.
7. Inicie os dois serviços com `npm run dev` na raiz. O Front-End estará em `http://localhost:5173`.

## Comandos

- `npm run dev`: inicia Front-End e Back-End.
- `npm run build`: gera o build do Front-End.
- `npm test`: executa os testes automatizados do Back-End (após instalar as dependências).
- `npm --prefix Back-End run import`: sincroniza o conteúdo de `Back-End/conteudo`.

## Notas de segurança

- Não compartilhe nem versione arquivos `.env` ou credenciais do Firebase Admin.
- `FIREBASE_AUTH_MODE=bypass` só é aceito quando `NODE_ENV=development`.
- Com `DB_SSL=true`, a validação de certificado TLS permanece habilitada. Use `DB_SSL_CA` quando o provedor exigir uma CA específica.
- Em produção, o servidor não inicia se a conexão inicial com o banco falhar.

## Limitações funcionais que ainda exigem desenvolvimento

- A avaliação final usa agora tabelas e endpoints autenticados; as alternativas corretas não são enviadas ao navegador e a pontuação é calculada no servidor, com requisito de conclusão das aulas. O pacote não contém questões cadastradas nem uma tela administrativa para gerenciá-las: a avaliação só aparece após cadastrar a avaliação, as questões e as alternativas diretamente no banco.
- Não existe painel administrativo para cadastrar e editar cursos/módulos/aulas. O conteúdo continua sendo gerenciado por Markdown e pelo importador.
- Certificados, matrículas, conquistas, histórico completo e DevIA não possuem implementação completa demonstrável no pacote original.
- Duração do curso não é mais inventada pelo título; a página mostra “Duração não informada” enquanto esse dado não existir no banco/API.
- A API depende das credenciais Firebase e do banco do ambiente de execução. Um build bem-sucedido não comprova a integração real com esses serviços.
