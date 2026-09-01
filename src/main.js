import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App.vue'
import Auth from './auth'
import HttpPlugin, { configureRuntimeConfig } from './http'
import router from './router'
import store from './store'

async function loadRuntimeConfig () {
  try {
    const response = await fetch('/runtime-config.json', {
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    })
    if (!response.ok) {
      throw new Error('runtime configuration is unavailable')
    }
    return configureRuntimeConfig(await response.json())
  } catch {
    console.warn('Runtime configuration is unavailable; safe defaults are active')
    return configureRuntimeConfig({})
  }
}

async function bootstrap () {
  await loadRuntimeConfig()

  const app = createApp(App)
  app.use(store)
  app.use(router)
  app.use(HttpPlugin)
  app.use(Auth)
  app.mount('#app')
}

void bootstrap()
