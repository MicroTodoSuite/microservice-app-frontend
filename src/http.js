import store from './store'

async function request (method, url, body) {
  const headers = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (store.state.auth.accessToken) {
    headers.Authorization = `Bearer ${store.state.auth.accessToken}`
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  const contentType = response.headers.get('content-type') || ''
  const responseBody = contentType.includes('application/json')
    ? await response.json()
    : await response.text()
  const result = { body: responseBody, status: response.status, ok: response.ok }
  if (!response.ok) {
    throw result
  }
  return result
}

const http = {
  get: url => request('GET', url),
  post: (url, body) => request('POST', url, body),
  delete: url => request('DELETE', url)
}

export default {
  ...http,
  install (app) {
    app.config.globalProperties.$http = http
  }
}
