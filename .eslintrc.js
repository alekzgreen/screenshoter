module.exports = {
  env: {
    browser: true,
    es6: true,
    webextensions: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['babel'],
  extends: ['airbnb', 'plugin:vue/essential'],
  globals: {
    process: true,
    module: true,
    global: true,
    chrome: true,
  },
};
