import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        cadastro: 'cadastro.html',
        cursos: 'cursos.html',
        menudashbord: 'menudashbord.html',
        recuperarsenha: 'recuperarsenha.html',
        visualizarcursos: 'visualizarcurso.html', // Atenção: altere para 'visualizarcursos.html' caso seu arquivo termine com "s"
      },
    },
  },
});
