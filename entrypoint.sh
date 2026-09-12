#!/bin/sh
set -eu

NGINX_RESOLVER="$(awk '$1 == "nameserver" { print $2; exit }' /etc/resolv.conf)"
: "${NGINX_RESOLVER:?no DNS resolver found in /etc/resolv.conf}"
export NGINX_RESOLVER

# Tracing (spec 010): nginx traces only when an OTLP endpoint is configured.
# ngx_otel_module still needs a syntactically valid endpoint, so an unset one
# is replaced by a local placeholder with tracing switched off.
if [ -n "${OTEL_EXPORTER_OTLP_ENDPOINT:-}" ]; then
  FRONTEND_OTEL_TRACE=on
else
  OTEL_EXPORTER_OTLP_ENDPOINT=127.0.0.1:4317
  FRONTEND_OTEL_TRACE=off
fi
export OTEL_EXPORTER_OTLP_ENDPOINT FRONTEND_OTEL_TRACE

: "${FRONTEND_REQUEST_TIMEOUT_MS:=5000}"
: "${FRONTEND_FEATURE_VERBOSE_ERRORS:=false}"

case "$FRONTEND_REQUEST_TIMEOUT_MS" in
  ''|*[!0-9]*) FRONTEND_REQUEST_TIMEOUT_MS=5000 ;;
esac
if [ "$FRONTEND_REQUEST_TIMEOUT_MS" -lt 100 ] || [ "$FRONTEND_REQUEST_TIMEOUT_MS" -gt 60000 ]; then
  FRONTEND_REQUEST_TIMEOUT_MS=5000
fi

case "$FRONTEND_FEATURE_VERBOSE_ERRORS" in
  true|false) ;;
  *) FRONTEND_FEATURE_VERBOSE_ERRORS=false ;;
esac

# This browser-readable file is intentionally allowlisted. It contains only
# bounded non-secret operational values and every feature toggle defaults off.
printf '{"requestTimeoutMs":%s,"features":{"verboseErrors":%s}}\n' \
  "$FRONTEND_REQUEST_TIMEOUT_MS" \
  "$FRONTEND_FEATURE_VERBOSE_ERRORS" \
  > /tmp/runtime-config.json

envsubst '$${AUTH_API_ADDRESS} $${TODOS_API_ADDRESS} $${OTEL_EXPORTER_OTLP_ENDPOINT} $${FRONTEND_OTEL_TRACE} $${NGINX_RESOLVER}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

# `/entrypoint.sh -t` renders the configuration and validates it without
# serving, so the image's nginx configuration can be checked directly.
if [ "${1:-}" = "-t" ]; then
  exec nginx -t
fi

exec nginx -g 'daemon off;'
