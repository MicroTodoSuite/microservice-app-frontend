import { beforeEach, describe, expect, it, vi } from 'vitest'
import store from '../../src/store'
import http from '../../src/http'

describe('frontend authentication state', () => {
  beforeEach(() => {
    localStorage.clear()
    store.commit('CLEAR_ALL_DATA')
  })

  it('clears persisted authentication data on logout', () => {
    store.commit('UPDATE_AUTH', { isLoggedIn: true, accessToken: 'token' })
    store.commit('CLEAR_ALL_DATA')

    expect(store.state.auth.isLoggedIn).toBe(false)
    expect(store.state.auth.accessToken).toBeNull()
    expect(localStorage.getItem('microservice-app-example-frontend')).toBeNull()
  })

  it('sends the bearer token and preserves the response contract', async () => {
    store.commit('UPDATE_AUTH', { isLoggedIn: true, accessToken: 'signed-token' })
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ 1: { id: 1, content: 'Existing todo' } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ))

    const response = await http.get('/todos')

    expect(fetch).toHaveBeenCalledWith('/todos', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer signed-token' })
    }))
    expect(response.status).toBe(200)
    expect(response.body['1'].content).toBe('Existing todo')
  })
})
