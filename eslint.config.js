import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginVue from 'eslint-plugin-vue'
import eslintTypescript from 'typescript-eslint'

import eslintVueParser from 'vue-eslint-parser'


export default [
  eslintPluginPrettier,
  ...eslintPluginVue.configs['flat/recommended'],
  ...eslintTypescript.configs.strict,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: eslintVueParser
    }
  }
];
