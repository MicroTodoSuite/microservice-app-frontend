import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import metrics from '../../njs/metrics.js'

// The number-typed js_shared_dict_zone njs exposes as ngx.shared.responses,
// reduced to the three calls metrics.js makes.
function sharedDict () {
  const values = new Map()
  return {
    incr (key, delta, init) {
      const next = (values.has(key) ? values.get(key) : init) + delta
      values.set(key, next)
      return next
    },
    get (key) {
      return values.get(key)
    },
    keys () {
      return [...values.keys()]
    }
  }
}

function request (status) {
  return {
    status,
    headersOut: {},
    return (code, body) {
      this.returned = { code, body }
    }
  }
}

function scrape () {
  const r = request(200)
  metrics.render(r)
  return r
}

// A server block's body, braces of nested blocks included.
function serverBlocks (nginx) {
  const blocks = []
  for (let start = nginx.indexOf('server {'); start !== -1; start = nginx.indexOf('server {', start + 1)) {
    let depth = 0
    for (let i = nginx.indexOf('{', start); i < nginx.length; i++) {
      if (nginx[i] === '{') depth++
      if (nginx[i] === '}' && --depth === 0) {
        blocks.push(nginx.slice(start, i + 1))
        break
      }
    }
  }
  return blocks
}

// Gitops spec 006 T018a: the canary gate reads the frontend's 5xx ratio, and
// nginx-prometheus-exporter's stub_status counts requests without their status.
describe('nginx response metrics', () => {
  beforeEach(() => {
    globalThis.ngx = { shared: { responses: sharedDict() } }
  })

  it('counts every logged response by its status code', () => {
    for (const status of [200, 200, 502]) metrics.count(request(status))

    const r = scrape()
    expect(r.returned.code).toBe(200)
    expect(r.headersOut['Content-Type']).toBe('text/plain; version=0.0.4')
    expect(r.returned.body).toContain('# TYPE frontend_http_responses_total counter\n')
    expect(r.returned.body).toContain('frontend_http_responses_total{status="200"} 2\n')
    expect(r.returned.body).toContain('frontend_http_responses_total{status="502"} 1\n')
  })

  it('declares the metric family before the first response', () => {
    const r = scrape()
    expect(r.returned.body).toBe(
      '# HELP frontend_http_responses_total Responses nginx sent, by HTTP status code.\n' +
      '# TYPE frontend_http_responses_total counter\n'
    )
  })

  it('adds nothing to the log line that evaluates it', () => {
    expect(metrics.count(request(200))).toBe('')
  })

  it('counts at the log phase, so probes with access_log off stay out', () => {
    const nginx = readFileSync(resolve('nginx.conf.template'), 'utf8')

    expect(nginx).toMatch(/^load_module modules\/ngx_http_js_module\.so;$/m)
    expect(nginx).toContain('js_path /etc/nginx/njs/;')
    expect(nginx).toContain('js_import metrics from metrics.js;')
    expect(nginx).toMatch(/js_shared_dict_zone zone=responses:\d+[km] type=number;/)
    expect(nginx).toContain('js_set $response_counted metrics.count;')
    expect(nginx).toContain("log_format response_count '$response_counted';")
    expect(nginx).toContain('access_log /dev/null response_count;')
    // Any access_log directive replaces nginx's implicit default log, so the
    // stdout access log has to be restated or it disappears.
    expect(nginx).toContain('access_log /var/log/nginx/access.log combined;')
    for (const path of ['/health/startup', '/health/ready', '/health/live']) {
      expect(nginx).toMatch(new RegExp(`location = ${path} \\{[^}]*access_log off;`))
    }
  })

  it('serves the counters only on a port the load balancer does not forward', () => {
    const nginx = readFileSync(resolve('nginx.conf.template'), 'utf8')
    const servers = serverBlocks(nginx)
    const publicServer = servers.find(block => /listen 8080;/.test(block))
    const metricsServer = servers.find(block => /listen 9114;/.test(block))

    expect(publicServer, 'the 8080 server must exist').toBeTruthy()
    expect(metricsServer, 'a 9114 server must serve the counters').toBeTruthy()
    expect(publicServer).not.toContain('metrics.render')
    expect(metricsServer).toMatch(/location = \/metrics \{\s*js_content metrics\.render;\s*\}/)
    expect(metricsServer).toContain('access_log off;')
  })

  it('ships the njs module to the path nginx imports it from', () => {
    const dockerfile = readFileSync(resolve('Dockerfile'), 'utf8')

    expect(dockerfile).toContain('COPY --chown=101:101 njs/metrics.js /etc/nginx/njs/metrics.js')
    // The build stage runs this suite, so it needs the module too.
    expect(dockerfile).toContain('COPY njs ./njs')
  })
})
