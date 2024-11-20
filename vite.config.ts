import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import checker from 'vite-plugin-checker';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    checker({
      vueTsc: {
        tsconfigPath: 'tsconfig.vue-tsc.json',
      },
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,ts,mjs,cjs,vue}"',
      },
    }),
  ],
});
