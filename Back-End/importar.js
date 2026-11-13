const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const mysql = require('mysql2/promise');

async function importarCursos() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1993', // <-- Coloque sua senha do MySQL aqui
    database: 'dev_cursos'
  });

  const pastaConteudo = path.join(__dirname, 'conteudo');
  const pastasCursos = fs.readdirSync(pastaConteudo);

  try {
    for (const pastaCurso of pastasCursos) {
      const caminhoCurso = path.join(pastaConteudo, pastaCurso);
      if (!fs.statSync(caminhoCurso).isDirectory()) continue;

      // 1. Insere na tabela CURSOS
      const cursoFile = matter.read(path.join(caminhoCurso, 'curso.md'));
      const [resCurso] = await db.execute(
        'INSERT INTO cursos (titulo, descricao, categoria, nivel) VALUES (?, ?, ?, ?)',
        [
          cursoFile.data.titulo,
          cursoFile.data.descricao || null,
          cursoFile.data.categoria,
          cursoFile.data.nivel || 'Iniciante'
        ]
      );
      const cursoId = resCurso.insertId;
      console.log(`✅ Curso criado: ${cursoFile.data.titulo}`);

      // 2. Insere na tabela MODULOS
      const itensCurso = fs.readdirSync(caminhoCurso).sort();
      for (const itemModulo of itensCurso) {
        const caminhoModulo = path.join(caminhoCurso, itemModulo);
        if (!fs.statSync(caminhoModulo).isDirectory()) continue;

        const moduloFile = matter.read(path.join(caminhoModulo, 'modulo.md'));
        const [resModulo] = await db.execute(
          'INSERT INTO modulos (curso_id, titulo, descricao, ordem) VALUES (?, ?, ?, ?)',
          [
            cursoId,
            moduloFile.data.titulo,
            moduloFile.data.descricao || null,
            moduloFile.data.ordem
          ]
        );
        const moduloId = resModulo.insertId;
        console.log(`  📂 Módulo criado: ${moduloFile.data.titulo}`);

        // 3. Insere na tabela AULAS
        const arquivosAulas = fs.readdirSync(caminhoModulo).sort();
        for (const arquivoAula of arquivosAulas) {
          if (arquivoAula === 'modulo.md' || !arquivoAula.endsWith('.md')) continue;

          const aulaFile = matter.read(path.join(caminhoModulo, arquivoAula));
          await db.execute(
            'INSERT INTO aulas (modulo_id, titulo, descricao, conteudo, video_url, material_url, ordem) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              moduloId,
              aulaFile.data.titulo,
              aulaFile.data.descricao || null,
              aulaFile.content,
              aulaFile.data.video_url || null,
              aulaFile.data.material_url || null,
              aulaFile.data.ordem
            ]
          );
          console.log(`    📄 Aula criada: ${aulaFile.data.titulo}`);
        }
      }
    }
    console.log('\n🎉 Todos os cursos foram importados para o banco dev_cursos!');
  } catch (erro) {
    console.error('❌ Erro ao importar:', erro);
  } finally {
    await db.end();
  }
}

importarCursos();
