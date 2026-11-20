# Correções realizadas no pacote DevCursos+

Este arquivo registra o escopo das alterações feitas nesta revisão do projeto.

## Corrigido neste pacote

1. **Autenticação Firebase Admin**: modo padrão estrito; bypass somente quando configurado explicitamente com `NODE_ENV=development`; bypass recusado fora do desenvolvimento. As rotas protegidas também recusam tokens de contas com e-mail ainda não verificado.
2. **Inicialização do servidor**: em produção, API não inicia se a conexão inicial com o MySQL falhar.
3. **TLS do MySQL**: removido `rejectUnauthorized: false`; certificado agora é validado e aceita CA configurável por `DB_SSL_CA`.
4. **Importador Markdown**: removida senha hardcoded; usa variáveis `.env`, transações e atualização de registros existentes para evitar duplicações em execuções repetidas.
5. **Login Google**: agora define persistência, sincroniza o perfil MySQL pelo endpoint já existente e só então persiste o token/perfil no navegador.
6. **Categorias da página inicial**: links direcionam ao catálogo (`menudashbord.html`) em vez da página de aprendizagem (`cursos.html`). O layout e os estilos das páginas inicial, login e cadastro não foram redesenhados.
7. **Dashboard**: consultas passam pelo serviço de API configurável; perfil `/me` trata corretamente a resposta `{ usuario }`; troca de curso carrega módulos/aulas/progresso; abertura de uma aula oferece o link para o ambiente de aprendizagem.
8. **Progresso**: conclusão só aparece no Front-End depois de confirmação do servidor; falha ao salvar não produz conclusão falsa; a tela de aprendizagem exige sessão; a reinicialização atualiza o servidor antes de limpar a interface.
9. **Favoritos**: adicionada tabela `favoritos` e rotas autenticadas para consultar e atualizar favoritos no banco, substituindo armazenamento apenas local na página de detalhes.
10. **Duração de cursos**: removidos valores fictícios inferidos pelo título.
11. **Avaliação final**: removida a prova Python fixa compartilhada entre cursos e a aprovação via `localStorage`. Foram adicionadas tabelas para avaliações, questões, alternativas, tentativas e respostas, além de endpoints autenticados. As alternativas corretas não são expostas ao navegador; o servidor verifica a conclusão das aulas, calcula a nota e registra a tentativa. A interface carrega e envia respostas pela API.
12. **Recuperação de senha**: conectada a página separada `recuperarsenha.html` ao envio de link pelo Firebase Authentication, em vez de exibir uma mensagem demonstrativa sem enviar nada.
13. **CORS**: removido o middleware manual de preflight que respondia com wildcard; a política passa pelo middleware `cors` e localhost amplo fica restrito a desenvolvimento.
14. **Configuração e documentação**: adicionados `.env.example`, instruções de instalação/importação/testes e este registro de escopo.

## Não foi possível concluir sem requisitos ou serviços externos

- Não foram criadas questões de prova: o pacote não contém conteúdo pedagógico de avaliação por curso. É necessário cadastrar registros nas tabelas `avaliacoes`, `questoes_avaliacao` e `alternativas_avaliacao`; a tabela `avaliacoes` define `minimo_acertos`.
- Não foi criado painel administrativo para cadastrar/editar cursos, módulos, aulas e questões. O gerenciamento continua dependendo do Markdown/importador e, para avaliações, de operações controladas no banco.
- Certificados, matrícula formal, conquistas, histórico de atividade e DevIA continuam como funcionalidades futuras; não seria correto preencher isso com dados fictícios.
- Não foi possível testar login real, Google OAuth, credenciais Firebase Admin, SSL do provedor, consultas reais ou persistência no MySQL/TiDB, pois esses serviços dependem de segredos e infraestrutura que não acompanham o ZIP.

## Ação necessária para aplicar as mudanças no ambiente

Execute novamente `Back-End/schema.sql` no banco para criar as tabelas `favoritos` e as tabelas de avaliação. Depois copie e preencha os arquivos `.env.example` conforme o ambiente. Sem isso, a API não conseguirá iniciar normalmente ou autenticar usuários.
