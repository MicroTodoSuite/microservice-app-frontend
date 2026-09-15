FROM node:24-alpine3.22@sha256:191c9f0080fcbbc6547a85dc0ff7988072214a355aabdc1d2ec55a7dae5eea8a AS build

WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Dockerfile is copied into this throwaway build stage only because the
# operational contract test asserts the runtime base image (spec 010).
COPY index.html vite.config.js vitest.config.js eslint.config.js Dockerfile ./
COPY nginx.conf.template entrypoint.sh ./
COPY src ./src
COPY njs ./njs
COPY test ./test
RUN npm run lint \
    && npm test \
    && npm run build

# The -otel variant is the same nginx 1.31.2 on Alpine 3.23 plus ngx_otel_module (spec 010).
FROM nginxinc/nginx-unprivileged:alpine3.23-otel@sha256:1490cbf02ddba36ae75ef947b570166c805a178898ebfbc3bb889e7580820052

USER root
RUN apk update \
    && apk add --upgrade --no-cache \
        libcrypto3=3.5.8-r0 \
        libexpat=2.8.4-r0 \
        libssl3=3.5.8-r0 \
        libuuid=2.41.6-r1 \
    && apk del --no-cache curl libcurl \
    && rm -rf /var/cache/apk/*

COPY --from=build --chown=101:101 /src/dist /usr/share/nginx/html
COPY --chown=101:101 nginx.conf.template /etc/nginx/nginx.conf.template
COPY --chown=101:101 njs/metrics.js /etc/nginx/njs/metrics.js
COPY --chown=101:101 --chmod=0755 entrypoint.sh /entrypoint.sh

# nginx-unprivileged maps its nginx account to UID/GID 101. A numeric image
# user lets Kubernetes verify runAsNonRoot before starting the container.
USER 101:101
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
