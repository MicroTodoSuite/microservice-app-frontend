#!/usr/bin/env bash
# Pact provider verification (spec 007 / US1, SC-001/SC-002). Replays each
# consumer's expected interactions against the running provider; a provider
# that breaks a consumer contract fails the gate. The bearer token is injected
# at verification time (every contract here is auth-agnostic).
set -euo pipefail

FRONTEND="${FRONTEND_URL:-http://localhost:8080}"
NETWORK="${COMPOSE_NETWORK:-microtodosuite-e2e_default}"
PACTS_DIR="$(cd "$(dirname "$0")/contracts" && pwd)"

# A real user login token: claims.username=admin, which both todos-api (via
# JWT auth) and users-api (via its own equalsIgnoreCase(claims.username)
# check) accept -- the same token auth-api itself mints for its own
# service-to-service call to users-api carries the identical claim.
token="$(curl -s -X POST "$FRONTEND/login" -H 'content-type: application/json' \
  -d '{"username":"admin","password":"admin"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["accessToken"])')"

verify_pact() {
  local pact_file="$1" provider="$2" provider_url="$3"
  docker run --rm --network "$NETWORK" \
    -v "$PACTS_DIR:/pacts:ro" \
    pactfoundation/pact-cli:latest \
    pact-provider-verifier "/pacts/$pact_file" \
    --provider "$provider" \
    --provider-base-url "$provider_url" \
    --custom-provider-header "Authorization: Bearer $token"
  echo "pact provider verification OK: $provider ($pact_file)"
}

verify_pact frontend-todos-api.json todos-api "${TODOS_API_PROVIDER_URL:-http://todos-api:8082}"
verify_pact frontend-auth-api.json auth-api "${AUTH_API_PROVIDER_URL:-http://auth-api:8000}"
verify_pact auth-api-users-api.json users-api "${USERS_API_PROVIDER_URL:-http://users-api:8083}"

echo "pact provider verification OK: all consumer contracts satisfied"
