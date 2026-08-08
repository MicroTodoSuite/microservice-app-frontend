## Overview

This service is the browser UI for the MicroTodoSuite distributed TODO application. It authenticates users, manages TODO items, and emits Zipkin traces; production assets are served by NGINX, which also proxies backend requests.

## Stack

- JavaScript using ES modules and stage-2 syntax, transpiled with Babel 6.26.3.
- Node.js 8.17.0 and npm 6.13.4 for builds; Vue 2.7.16 and `vue-template-compiler` 2.7.16 are resolved in `package-lock.json`.
- Vue Router 2.8.1, Vuex 2.5.0, Vue Resource 1.5.3, and webpack 2.7.0.
- Production runtime: the unpinned `nginx:alpine` image.

## Commands

- Install dependencies: `npm install` (README and Dockerfile); the release workflow uses `npm ci`.
- Build: `npm run build`.
- Run locally: `PORT=8080 AUTH_API_ADDRESS=http://127.0.0.1:8000 TODOS_API_ADDRESS=http://127.0.0.1:8082 npm start`.
- Development alias: `npm run dev` (runs the same dev server as `npm start`).
- Lint: `npm run lint`.
- Test: no test script, test runner, or tracked test suite exists in this repository.

## Structure

- `src/components/`: Vue single-file components for login, navigation, TODOs, TODO items, and the spinner.
- `src/router/`: routes for `/login`, `/`, and the `/todos` alias, including the login guard.
- `src/store/`: Vuex state, mutations, and local-storage persistence.
- `src/auth.js` and `src/zipkin.js`: JWT authentication and Zipkin HTTP instrumentation plugins.
- `build/` and `config/`: custom webpack 2 build/dev-server scripts and environment-specific build settings.
- `static/`, `src/assets/`, and `index.html`: static and entry-page assets.
- `Dockerfile`, `entrypoint.sh`, and `nginx.conf.template`: two-stage image build and runtime proxy configuration.
- `.github/workflows/`: semantic release and the current Azure Container Apps deployment workflow.

## Conventions

- Use Standard JavaScript style: two-space indentation, no semicolons, and lint both `.js` and `.vue` files.
- Use the `@` alias for `src`; API calls remain relative (`/login`, `/todos`, `/zipkin`) and are routed by a proxy.
- Authentication state and the JWT are persisted in browser local storage; Vue Resource interceptors add auth and Zipkin headers.
- Keep project artifacts in English. Use short-lived trunk-based branches and feature flags for incomplete work; repository specifications are authoritative when present.

## Notes for the Kubernetes migration

- The production image exposes and NGINX listens on TCP 8080. `PORT` only controls the development server; the production template does not substitute it.
- Production requires `AUTH_API_ADDRESS`, `TODOS_API_ADDRESS`, and `ZIPKIN_URL`; `entrypoint.sh` substitutes them into NGINX configuration at startup. `ZIPKIN_URL` is missing from the README configuration list.
- External dependencies are `auth-api` over HTTP, `todos-api` over HTTP, and a Zipkin HTTP collector. No direct database or Redis client is present.
- Preserve the SPA fallback and review `/nginx_status`, which is currently exposed without access restrictions, when defining health probes and ingress rules.
- Review Node.js 8.17.0, `npm install` instead of `npm ci`, the unpinned NGINX image, `COPY . .` without a `.dockerignore`, and the absence of `USER` and `HEALTHCHECK` directives.
- `.github/workflows/development.yml` pushes ACR images tagged with a release and `latest`, then directly updates and restarts an Azure Container App. Replace that path with an immutable image update committed to `microservice-app-gitops` and reconciled by ArgoCD; never apply directly to a managed cluster.
- Use the single AWS account and isolate environments through separate clusters, VPCs, or namespaces.
