import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintTypescript from 'typescript-eslint';
import eslintJavascript from '@eslint/js';

import eslintVueParser from 'vue-eslint-parser';

export default [
  eslintPluginPrettier,
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          tabWidth: 2,
          useTabs: false,
          singleQuote: true,
        },
      ],
    },
  },
  ...eslintPluginVue.configs['flat/recommended'],
  ...eslintTypescript.configs.strict,
  eslintJavascript.configs.recommended,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: eslintVueParser,
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
];
