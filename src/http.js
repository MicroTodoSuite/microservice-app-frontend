import store from './store'

const correlationHeader = 'X-Request-Id'
const defaultRuntimeConfig = Object.freeze({
  requestTimeoutMs: 5000,
  features: Object.freeze({ verboseErrors: false })
})

let runtimeConfig = defaultRuntimeConfig

function normalizeRuntimeConfig (candidate = {}) {
  const timeout = Number(candidate.requestTimeoutMs)
  const requestTimeoutMs = Number.isInteger(timeout) && timeout >= 100 && timeout <= 60000
    ? timeout
    : defaultRuntimeConfig.requestTimeoutMs

  return Object.freeze({
    requestTimeoutMs,
    features: Object.freeze({
      verboseErrors: candidate.features?.verboseErrors === true
    })
  })
}

export function configureRuntimeConfig (candidate) {
  runtimeConfig = normalizeRuntimeConfig(candidate)
  return runtimeConfig
}

export function getRuntimeConfig () {
  return runtimeConfig
}

export function resetOperationalStateForTests () {
  runtimeConfig = defaultRuntimeConfig
}

function validCorrelationId (value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(value)
}

function correlationIdFor (preferred) {
  if (validCorrelationId(preferred)) {
    return preferred
  }
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function telemetryPath (url) {
  try {
    return new URL(url, globalThis.location?.origin || 'http://localhost').pathname
  } catch {
    return 'invalid-url'
  }
}

function emitTelemetry (detail) {
  if (typeof globalThis.dispatchEvent === 'function' && typeof globalThis.CustomEvent === 'function') {
    globalThis.dispatchEvent(new CustomEvent('microtodosuite:http', { detail }))
  }
}

function normalizedTransportFailure (error, correlationId) {
  const failure = {
    body: { message: 'Service temporarily unavailable. Please try again.' },
    status: 0,
    ok: false,
    correlationId
  }
  if (runtimeConfig.features.verboseErrors) {
    failure.body.detail = error?.name === 'AbortError' ? 'Request timed out' : String(error?.message || 'Network error')
  }
  return failure
}

async function request (method, url, body, options = {}) {
  const correlationId = correlationIdFor(options.correlationId)
  const headers = { [correlationHeader]: correlationId }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (store.state.auth.accessToken) {
    headers.Authorization = `Bearer ${store.state.auth.accessToken}`
  }

  const startedAt = performance.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), runtimeConfig.requestTimeoutMs)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    })
    const contentType = response.headers.get('content-type') || ''
    const responseBody = contentType.includes('application/json')
      ? await response.json()
      : await response.text()
    const responseCorrelationId = response.headers.get(correlationHeader) || correlationId
    const result = {
      body: responseBody,
      status: response.status,
      ok: response.ok,
      correlationId: responseCorrelationId
    }

    emitTelemetry({
      method,
      path: telemetryPath(url),
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
      correlationId: responseCorrelationId,
      outcome: response.ok ? 'success' : 'error'
    })

    if (!response.ok) {
      throw result
    }
    return result
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && 'ok' in error) {
      throw error
    }

    const failure = normalizedTransportFailure(error, correlationId)
    emitTelemetry({
      method,
      path: telemetryPath(url),
      status: 0,
      durationMs: Math.round(performance.now() - startedAt),
      correlationId,
      outcome: 'transport-error'
    })
    throw failure
  } finally {
    clearTimeout(timeout)
  }
}

const http = {
  get: (url, options) => request('GET', url, undefined, options),
  post: (url, body, options) => request('POST', url, body, options),
  delete: (url, options) => request('DELETE', url, undefined, options)
}

export default {
  ...http,
  install (app) {
    app.config.globalProperties.$http = http
  }
}
