import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    // e2e/ holds Playwright specs (spec 007); keep them out of the Vitest unit run.
    exclude: [...configDefaults.exclude, 'e2e/**']
  }
})
