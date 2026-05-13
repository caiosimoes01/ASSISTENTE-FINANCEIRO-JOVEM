import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Ambiente de teste puro (sem DOM) para o core financeiro
    environment: 'node',
    // Inclui os testes na pasta /tests e também arquivos *.test.ts em src
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    // Relatório de cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/core/**'],
      exclude: ['src/core/**/index.ts'],
    },
    // Globals para evitar imports de describe/it/expect em cada arquivo
    globals: true,
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
});
