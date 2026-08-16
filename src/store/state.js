export const STORAGE_KEY = 'microservice-app-example-frontend'

export function initialState () {
  const fallback = {
    auth: {
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null
    },
    user: {
      name: null,
      role: null
    }
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : fallback
}
