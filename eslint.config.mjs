import eslint from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  prettierPlugin,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
      'no-restricted-syntax': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
);
