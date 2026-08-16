import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App.vue'
import Auth from './auth'
import HttpPlugin from './http'
import router from './router'
import store from './store'

const app = createApp(App)
app.use(store)
app.use(router)
app.use(HttpPlugin)
app.use(Auth)
app.mount('#app')
