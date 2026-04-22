import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Adicione a linha abaixo para que os caminhos dos arquivos (JS/CSS) funcionem no GitHub
  base: '/amelogibbs/dicompel-configurador/',
});
