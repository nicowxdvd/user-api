// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    // El dominio no puede depender del framework ni de la infraestructura:
    // eso es lo que hace que sea hexagonal y no un Repository Pattern con nombres nuevos.
    files: ['src/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@nestjs/*'], message: 'El dominio no puede depender de NestJS.' },
          { group: ['typeorm', 'class-validator', 'class-transformer', 'bcrypt', 'express'], message: 'El dominio no puede depender de infraestructura; define un puerto.' },
          { group: ['**/infrastructure/**', '**/application/**'], message: 'El dominio no puede depender de infraestructura ni de aplicación.' },
        ],
      }],
    },
  },
);
