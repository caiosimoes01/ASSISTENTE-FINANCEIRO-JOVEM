module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    // Garante que páginas exportem apenas componentes (necessário para HMR)
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    // Proíbe any explícito — use tipos reais
    '@typescript-eslint/no-explicit-any': 'error',
    // Proíbe variáveis não utilizadas
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Consistência de importações de tipo
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  },
};
