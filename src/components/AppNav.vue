<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
    <a class="navbar-brand" href="#">TODOs app microservice</a>
    <ul class="navbar-nav mr-auto">
      <li class="nav-item" v-show="isAdmin()">
        <a class="btn btn-success me-sm-2" href="#/admin">Administrator</a>
      </li>
    </ul>

    <ul class="navbar-nav">
      <li class="nav-item" v-show="!isLoggedIn()">
        <a class="btn btn-success me-sm-2" href="#/login">Login</a>
      </li>
      <li class="nav-item" v-show="isLoggedIn()">
        <button class="btn btn-danger me-sm-2" @click="logout()">Logout</button>
      </li>
    </ul>
  </nav>

</template>

<script>

import Auth from '@/auth'

export default {
  name: 'app-nav',

  methods: {
    logout () {
      Auth.logout()
    },
    isLoggedIn () {
      return Auth.isLoggedIn()
    },
    isAdmin () {
      return Auth.isAdmin()
    }
  }
}
</script>
