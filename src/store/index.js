import { createStore } from 'vuex'
import * as mutations from './mutations'
import plugins from './plugins'
import { initialState } from './state'

export default createStore({
  state: initialState(),
  mutations,
  plugins
})
