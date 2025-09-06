import prettierConfig from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'

import vue from 'eslint-plugin-vue'

export default [
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      vue,
      import: importPlugin,
      prettier,
    },
    rules: {
      // --- Prettier ---
      'prettier/prettier': 'error',

      // --- Vue ---
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'never', component: 'always' },
        },
      ],

      // --- Import 排序 ---
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  // 让 Vue SFC 正常工作
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  // 兼容 Prettier 的配置（相当于 extends: ["prettier"]）
  prettierConfig,
]
