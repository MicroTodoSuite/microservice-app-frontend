#!/usr/bin/env bash
# Pact provider verification (spec 007 / US1, SC-002). Replays the consumer's
# expected interactions against the running provider; a provider that breaks a
# consumer contract fails the gate. The bearer token is injected at verification
# time (the contract is auth-agnostic).
set -euo pipefail

FRONTEND="${FRONTEND_URL:-http://localhost:8080}"
PROVIDER_URL="${PROVIDER_URL:-http://todos-api:8082}"
NETWORK="${COMPOSE_NETWORK:-microtodosuite-e2e_default}"
PACTS_DIR="$(cd "$(dirname "$0")/contracts" && pwd)"

token="$(curl -s -X POST "$FRONTEND/login" -H 'content-type: application/json' \
  -d '{"username":"admin","password":"admin"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["accessToken"])')"

docker run --rm --network "$NETWORK" \
  -v "$PACTS_DIR:/pacts:ro" \
  pactfoundation/pact-cli:latest \
  pact-provider-verifier /pacts/frontend-todos-api.json \
  --provider todos-api \
  --provider-base-url "$PROVIDER_URL" \
  --custom-provider-header "Authorization: Bearer $token"
echo "pact provider verification OK"
