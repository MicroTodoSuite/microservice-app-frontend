// Response counts by HTTP status code, read by Prometheus for the canary
// gate's 5xx ratio (gitops specs/006-observability-platform-foundation T018a).
// nginx calls count() at the log phase, through the response_count access
// log, so it sees the final status of every logged response.

const family = 'frontend_http_responses_total'

function count (r) {
  ngx.shared.responses.incr(String(r.status), 1, 0)
  return ''
}

function render (r) {
  const responses = ngx.shared.responses
  let body = '# HELP ' + family + ' Responses nginx sent, by HTTP status code.\n' +
    '# TYPE ' + family + ' counter\n'
  responses.keys().forEach(function (status) {
    body += family + '{status="' + status + '"} ' + responses.get(status) + '\n'
  })
  r.headersOut['Content-Type'] = 'text/plain; version=0.0.4'
  r.return(200, body)
}

export default { count, render }
