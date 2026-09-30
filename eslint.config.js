// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'dist-android/*', 'web-dist/*', 'android/*', 'ios/*', '.expo/*', 'docs/*', 'store/*'],
  },
  {
    rules: {
      'no-console': 'error',
      'no-alert': 'error',
    },
  },
  {
    // Скрипты сборки запускаются в Node и пишут прогресс в консоль.
    files: ['scripts/**', 'tests/**'],
    rules: {
      'no-console': 'off',
    },
  },
]);
