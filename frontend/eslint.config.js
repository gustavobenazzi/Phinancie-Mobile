// frontend/eslint.config.js
import js from '@eslint/js';
import reactNative from '@react-native/eslint-config';
import globals from 'globals';

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
    ...reactNative,
    rules: {
      ...js.configs.recommended.rules,
      ...reactNative.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
];