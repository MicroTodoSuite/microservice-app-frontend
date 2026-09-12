# Frontend

UI for sample distributed TODO application.

## Configuration

- `AUTH_API_ADDRESS` - address of `auth-api` for authentication
- `TODOS_API_ADDRESS` - address of `todos-api` for TODO CRUD
- `ZIPKIN_URL` - address of the Zipkin UI proxied at `/zipkin`
- `FRONTEND_REQUEST_TIMEOUT_MS` - browser request timeout between 100 and 60000 milliseconds; defaults to `5000`
- `FRONTEND_FEATURE_VERBOSE_ERRORS` - exposes transport error details when set to `true`; defaults to `false`

The production container exposes startup, readiness, and liveness checks at
`/health/startup`, `/health/ready`, and `/health/live`. It also generates an
allowlisted `/runtime-config.json`; no secret values are written to that file.

## Building

``` bash
# install dependencies
npm install

# build application
npm run build
```

## Running

``` bash
AUTH_API_ADDRESS=http://127.0.0.1:8000 TODOS_API_ADDRESS=http://127.0.0.1:8082 npm start
```

## Dependencies
The software required to run this microservice, and the version that was tested:
|  Dependency | Version  |
|-------------|----------|
| Node        | 24       |
