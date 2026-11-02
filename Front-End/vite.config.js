import { defineConfig } from 'vite';
import { resolve } from 'path';
import { mainModule } from 'process';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        mainModule: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        cadastro: resolve(__dirname, 'cadastro.html'),
        cursos: resolve(__dirname, 'cursos.html'),
        menudashbord: resolve(__dirname, 'menudashbord.html'),
        recuperarsenha: resolve(__dirname, 'recuperarsenha.html'),
        visualizarcursos: resolve(__dirname, 'visualizarcursos.html'),
      },
    },
  },
});
