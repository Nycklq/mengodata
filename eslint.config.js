import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const noComments = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { forbidden: 'Comentários são proibidos.' },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          context.report({ loc: comment.loc, messageId: 'forbidden' });
        }
      },
    };
  },
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '.venv/**',
      '**/dist/**',
      '**/*.egg-info/**',
      '.tmp/**',
      '.local/**',
      '**/coverage/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: { project: { rules: { 'no-comments': noComments } } },
    rules: {
      'project/no-comments': 'error',
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z]', argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['frontend/src/**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  {
    files: [
      'packages/domain/src/**/*.js',
      'backend/src/domain/**/*.js',
      'backend/src/application/**/*.js',
      'frontend/src/features/*/domain/**/*.js',
      'frontend/src/features/*/application/**/*.js',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'express',
            'pg',
            'react',
            'react-dom',
            'zod',
            'node:*',
            '@tanstack/*',
            '**/infrastructure/**',
            '**/interfaces/**',
            '**/presentation/**',
            '**/main/**',
          ],
        },
      ],
    },
  },
];
