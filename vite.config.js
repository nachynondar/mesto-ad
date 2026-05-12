import { defineConfig } from 'vite';

export default defineConfig({
  // Это критически важно для GitHub Pages!
  // Теперь пути будут начинаться с /mesto-production/
  base: '/mesto-production/', 
  server: {
    open: true,
  },
});