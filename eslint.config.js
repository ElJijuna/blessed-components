import eslintTs from 'super-configs/eslint/ts';

export default [
  {
    ignores: ['coverage/**', 'dist/**', 'node_modules/**'],
  },
  ...eslintTs,
];
