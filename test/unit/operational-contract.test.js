import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import http, {
  configureRuntimeConfig,
  getRuntimeConfig,
  resetOperationalStateForTests
} from '../../src/http'

const correlationHeader = 'X-Request-Id'

describe('frontend operational contract', () => {
  beforeEach(() => {
    resetOperationalStateForTests()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps every runtime feature toggle off by default', () => {
    configureRuntimeConfig({})

    expect(getRuntimeConfig().features.verboseErrors).toBe(false)
  })

  it('accepts only bounded non-secret runtime configuration', () => {
    configureRuntimeConfig({
      requestTimeoutMs: 1250,
      features: { verboseErrors: true },
      jwtSecret: 'must-never-enter-browser-config'
    })

    const rendered = JSON.stringify(getRuntimeConfig())
    expect(getRuntimeConfig().requestTimeoutMs).toBe(1250)
    expect(getRuntimeConfig().features.verboseErrors).toBe(true)
    expect(rendered).not.toContain('must-never-enter-browser-config')
    expect(rendered).not.toContain('jwtSecret')
  })

  it('generates and forwards a correlation id for every API request', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ))

    const response = await http.get('/todos')
    const request = fetch.mock.calls[0][1]

    expect(request.headers[correlationHeader]).toBeTruthy()
    expect(response.correlationId).toBe(request.headers[correlationHeader])
  })

  it('preserves a caller correlation id and emits value-blind request telemetry', async () => {
    const events = []
    window.addEventListener('microtodosuite:http', event => events.push(event.detail), { once: true })
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('', { status: 204 }))

    await http.get('/todos', { correlationId: 'browser-journey-123' })

    expect(fetch.mock.calls[0][1].headers[correlationHeader]).toBe('browser-journey-123')
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      method: 'GET',
      path: '/todos',
      status: 204,
      correlationId: 'browser-journey-123',
      outcome: 'success'
    })
    expect(JSON.stringify(events[0])).not.toContain('Authorization')
  })

  it('turns a network failure into a stable user-facing error with its correlation id', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('backend socket detail'))

    await expect(http.get('/todos', { correlationId: 'failed-request-456' })).rejects.toMatchObject({
      status: 0,
      correlationId: 'failed-request-456',
      body: {
        message: 'Service temporarily unavailable. Please try again.'
      }
    })
  })

  it('declares separate startup, readiness, and liveness endpoints in nginx', () => {
    const nginx = readFileSync(new URL('../../nginx.conf.template', import.meta.url), 'utf8')
    const entrypoint = readFileSync(new URL('../../entrypoint.sh', import.meta.url), 'utf8')

    for (const path of ['/health/startup', '/health/ready', '/health/live']) {
      expect(nginx).toContain(`location = ${path}`)
    }
    expect(nginx).toContain('location = /runtime-config.json')
    expect(entrypoint).toContain('FRONTEND_REQUEST_TIMEOUT_MS')
    expect(entrypoint).toContain('FRONTEND_FEATURE_VERBOSE_ERRORS')
  })
})
