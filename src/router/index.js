import { createRouter, createWebHashHistory } from 'vue-router'
import Auth from '../auth'
import Login from '../components/Login.vue'
import Todos from '../components/Todos.vue'

function requireLoggedIn (to) {
  if (!Auth.isLoggedIn()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
}

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      alias: '/todos',
      name: 'todos',
      component: Todos,
      beforeEnter: requireLoggedIn
    }
  ]
})
