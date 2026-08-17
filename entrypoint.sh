#!/bin/sh
set -eu

NGINX_RESOLVER="$(awk '$1 == "nameserver" { print $2; exit }' /etc/resolv.conf)"
: "${NGINX_RESOLVER:?no DNS resolver found in /etc/resolv.conf}"
export NGINX_RESOLVER

envsubst '$${AUTH_API_ADDRESS} $${TODOS_API_ADDRESS} $${ZIPKIN_URL} $${NGINX_RESOLVER}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'
