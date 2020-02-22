module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'key-spacing': 0,
    'no-console': 0,
    'no-multi-spaces': 0,
    'newline-per-chained-call': 0,
    'no-await-in-loop': 0,
    'no-restricted-syntax': 0
  },
};
