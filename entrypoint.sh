#!/bin/sh
set -eu

envsubst '$${AUTH_API_ADDRESS} $${TODOS_API_ADDRESS} $${ZIPKIN_URL}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'
