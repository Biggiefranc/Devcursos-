import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        cadastro: 'cadastro.html',
        cursos: 'cursos.html',
        menudashbord: 'menudashbord.html',
        recuperarsenha: 'recuperarsenha.html',
        visualizarcursos: 'visualizarcurso.html',
      },
    },
  },
});
