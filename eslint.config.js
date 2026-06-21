import eslintTs from 'super-configs/eslint/ts';

export default [
  {
    ignores: ['coverage/**', 'dist/**', 'docs/api/**', 'node_modules/**'],
  },
  ...eslintTs,
];
