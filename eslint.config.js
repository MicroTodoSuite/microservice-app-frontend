import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  {
    ignores: ['build/**', 'config/**', 'dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['src/**/*.{js,vue}', 'test/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
]
