# Build stage. Node 14, not Node 8 (EOL): node-sass@4.5.3's prebuilt native
# binding only exists for Node ABI <=83 (Node <=14); no currently-supported
# Node LTS has a matching prebuild, and this toolchain isn't being upgraded
# here. This stage never ships, only its dist/ output does.
FROM node:14.21.3-bullseye AS builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# Runtime stage. Pinned, already-non-root NGINX (upstream-maintained, not hand-rolled).
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY --from=builder --chown=nginx:root /app/dist /usr/share/nginx/html
COPY --chown=nginx:root nginx.conf.template /etc/nginx/nginx.conf.template
COPY --chown=nginx:root entrypoint.sh /entrypoint.sh

EXPOSE 8080

# Shell form is required here for the `|| exit 1` fallback.
# 127.0.0.1, not localhost: this image resolves localhost to ::1 first, and
# nginx only binds 0.0.0.0:8080 (IPv4), so the IPv6 loopback gets refused.
# hadolint ignore=DL3025
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/ || exit 1

# entrypoint.sh isn't tracked with the executable bit; run it via sh rather
# than relying on chmod (which would need a root step this image doesn't need otherwise).
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
