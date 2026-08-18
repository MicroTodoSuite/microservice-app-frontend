import { UPDATE_AUTH, UPDATE_USER, CLEAR_ALL_DATA } from './mutations'

describe('store mutations', () => {
  test('UPDATE_AUTH replaces the auth object on state', () => {
    const state = { auth: null }
    const auth = { isLoggedIn: true, accessToken: 'tok' }

    UPDATE_AUTH(state, auth)

    expect(state.auth).toBe(auth)
  })

  test('UPDATE_USER replaces the user object on state', () => {
    const state = { user: null }
    const user = { name: 'Ada', role: 'ADMIN' }

    UPDATE_USER(state, user)

    expect(state.user).toBe(user)
  })

  test('CLEAR_ALL_DATA resets auth and user to logged-out defaults', () => {
    const state = {
      auth: { isLoggedIn: true, accessToken: 'tok' },
      user: { name: 'Ada', role: 'ADMIN' },
    }

    CLEAR_ALL_DATA(state)

    expect(state.auth.isLoggedIn).toBe(false)
    expect(state.auth.accessToken).toBeNull()
    expect(state.user.name).toBe('')
    expect(state.user.role).toBeNull()
  })
})
