import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "localhost",
    port: 4173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        catalogo: "catalogo.html",
        login: "login.html",
        cadastro: "cadastro.html",
        cursos: "cursos.html",
        menudashbord: "menudashbord.html",
        salvos: "salvos.html",
        recuperarsenha: "recuperarsenha.html",
        visualizarcurso: "visualizarcurso.html",
        legado: "tela.html",
      },
    },
  },
});
