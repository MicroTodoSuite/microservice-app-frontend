import { jwtDecode } from 'jwt-decode'
import http from './http'
import router from './router'
import store from './store'

const ROLE_ADMIN = 'ADMIN'

const Auth = {
  install (app) {
    app.config.globalProperties.$auth = this
  },

  login (credentials, redirect) {
    return http.post('/login', {
      username: credentials.username,
      password: credentials.password
    }).then(response => {
      this._storeToken(response)
      if (redirect) {
        router.push({ name: redirect })
      }
      return response
    }).catch(errorResponse => errorResponse)
  },

  logout () {
    store.commit('CLEAR_ALL_DATA')
    router.push({ name: 'login' })
  },

  isAdmin () {
    return store.state.user.role === ROLE_ADMIN
  },

  isLoggedIn () {
    return store.state.auth.isLoggedIn
  },

  _storeToken (response) {
    const auth = {
      ...store.state.auth,
      isLoggedIn: true,
      accessToken: response.body.accessToken
    }
    const claims = jwtDecode(auth.accessToken)
    const user = {
      ...store.state.user,
      name: [claims.firstname, claims.lastname].filter(Boolean).join(' '),
      role: claims.role
    }
    store.commit('UPDATE_AUTH', auth)
    store.commit('UPDATE_USER', user)
  }
}

export default Auth
