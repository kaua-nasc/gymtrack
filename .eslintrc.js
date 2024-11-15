module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'no-relative-import-paths', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    ignorePatterns: ['.eslintrc.js'],
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          { target: './src/module/shared', from: './src/module/content' },
          {
            target: './src/module/shared',
            from: './src/module/identity',
          },
          { target: './src/module/content', from: './src/module/identity' },
          { target: './src/module/identity', from: './src/module/content' },
        ],
      },
    ],
  },
};
