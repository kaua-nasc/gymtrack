import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import { projectStructurePlugin } from 'eslint-plugin-project-structure';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/.eslintrc.js', 'eslint.config.mjs'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript'
    )
  ),
  {
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      'no-relative-import-paths': noRelativeImportPaths,
      import: fixupPluginRules(_import),
      'project-structure': projectStructurePlugin,
      eslintPluginPrettierRecommended,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },

    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
      'project-structure/folder-structure-config-path': '.projectStructurerc.json',
    },

    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'error',

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@nestjs/config',
              importNames: ['ConfigModule', 'ConfigService'],
              message: 'Please use classes from @src/shared/module/config instead',
            },
          ],
        },
      ],

      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared',
              from: './src/module/content*',
            },
            {
              target: './src/shared',
              from: './src/module/identity',
            },
            {
              target: './src/shared',
              from: './src/module/billing',
            },
            {
              target: './src/module/content*',
              from: './src/module/billing',
            },
            {
              target: './src/module/content*',
              from: './src/module/identity',
            },
            {
              target: './src/module/billing',
              from: './src/module/content',
            },
            {
              target: './src/module/billing',
              from: './src/module/identity',
            },
            {
              target: './src/module/identity',
              from: './src/module/content',
            },
            {
              target: './src/module/identity',
              from: './src/module/billing',
            },
          ],
        },
      ],
      'project-structure/folder-structure': 'error',
    },
  },
];
