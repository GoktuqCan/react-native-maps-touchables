module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    semi: ['error', 'never'],
    '@typescript-eslint/no-shadow': ['error'],
    'no-shadow': 'off',
    'no-undef': 'off',
    curly: 'off',
    'react-native/no-inline-styles': 'off',
    'dot-notation': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-spaced-func': 'off',
  },
};
