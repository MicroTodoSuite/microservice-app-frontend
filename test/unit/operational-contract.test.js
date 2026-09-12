import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))

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
    const nginx = readFileSync(resolve('nginx.conf.template'), 'utf8')
    const entrypoint = readFileSync(resolve('entrypoint.sh'), 'utf8')

    for (const path of ['/health/startup', '/health/ready', '/health/live']) {
      expect(nginx).toContain(`location = ${path}`)
    }
    expect(nginx).toContain('location = /runtime-config.json')
    expect(nginx).toContain('alias /tmp/runtime-config.json')
    expect(entrypoint).toContain('FRONTEND_REQUEST_TIMEOUT_MS')
    expect(entrypoint).toContain('FRONTEND_FEATURE_VERBOSE_ERRORS')
    expect(entrypoint).toContain('> /tmp/runtime-config.json')
  })

  // Spec 010: nginx is the frontend's entry point, so it starts or continues
  // each request's trace and propagates W3C context to the APIs. Only the two
  // proxied locations are traced; probes, runtime config, and static files
  // would bury real requests.
  it('traces only the proxied API locations through OpenTelemetry', () => {
    const nginx = readFileSync(resolve('nginx.conf.template'), 'utf8')
    const locationBody = name => {
      // A location body may hold ${VAR} placeholders, whose braces are part of it.
      const match = nginx.match(new RegExp(`location ${name} \\{((?:\\$\\{[A-Z_]+\\}|[^}])*)\\}`))
      expect(match, `location ${name} must exist`).toBeTruthy()
      return match[1]
    }

    expect(nginx).toMatch(/^load_module modules\/ngx_otel_module\.so;$/m)
    expect(nginx).toMatch(/otel_exporter\s*\{\s*endpoint \$\{OTEL_EXPORTER_OTLP_ENDPOINT\};\s*\}/)
    expect(nginx).toContain('otel_service_name frontend;')

    for (const name of ['/login', '/todos']) {
      const body = locationBody(name)
      expect(body).toContain('otel_trace ${FRONTEND_OTEL_TRACE};')
      expect(body).toContain('otel_trace_context propagate;')
    }
    expect(nginx.match(/otel_trace /g)).toHaveLength(2)
    expect(nginx).not.toMatch(/zipkin/i)
  })

  it('starts nginx with tracing switched by the OTLP endpoint on the OpenTelemetry image', () => {
    const entrypoint = readFileSync(resolve('entrypoint.sh'), 'utf8')
    const dockerfile = readFileSync(resolve('Dockerfile'), 'utf8')

    expect(entrypoint).not.toMatch(/zipkin/i)
    expect(entrypoint).toContain('FRONTEND_OTEL_TRACE=off')
    expect(entrypoint).toContain('$${OTEL_EXPORTER_OTLP_ENDPOINT}')
    expect(entrypoint).toContain('$${FRONTEND_OTEL_TRACE}')
    expect(entrypoint).toMatch(/nginx -t/)
    expect(dockerfile).toContain(
      'FROM nginxinc/nginx-unprivileged:alpine3.23-otel@sha256:1490cbf02ddba36ae75ef947b570166c805a178898ebfbc3bb889e7580820052'
    )
  })
})
