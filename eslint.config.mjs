import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import { rules } from "eslint-plugin-react";

export default [
  {
    languageOptions: {
      globals: globals.node
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['./gen/*.{js,ts}'],
    files: ['**/*.{mjs,js,ts}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error', {
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^ignore',
          ignoresRestSiblings: true
        }
      ],
      'eol-last': 'error',
      'indent': [
        'error',
        4,
        {
          SwitchCase: 1
        }
      ],
      'max-len': [
        'error',
        120
      ],
      'max-lines-per-function': [
        'error',
        30
      ],
      'object-curly-spacing': [
        'error',
        'always'
      ],
      quotes: [
        'error',
        'single'
      ],
      'quotes-props': [
        'error',
        'as-needed'
      ],
      semi: [
        'error',
        'always'
      ],
      'sort-improts': [
        'error',
        {
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true
        }
      ]
    }
  }
]