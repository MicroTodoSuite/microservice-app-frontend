FROM node:24-alpine3.22@sha256:191c9f0080fcbbc6547a85dc0ff7988072214a355aabdc1d2ec55a7dae5eea8a AS build

WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY index.html vite.config.js vitest.config.js eslint.config.js ./
COPY src ./src
COPY test ./test
RUN npm run lint \
    && npm test \
    && npm run build

FROM nginxinc/nginx-unprivileged:alpine3.23@sha256:6320020c7da8714feab524e02c08c5a1958675c4e68700e93a2fd8970b065786

USER root
RUN apk del --no-cache curl libcurl

COPY --from=build --chown=nginx:root /src/dist /usr/share/nginx/html
COPY --chown=nginx:root nginx.conf.template /etc/nginx/nginx.conf.template
COPY --chown=nginx:root --chmod=0755 entrypoint.sh /entrypoint.sh

USER nginx
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
