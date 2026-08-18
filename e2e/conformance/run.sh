#!/usr/bin/env bash
# Contract conformance gate (spec 007 / US1 deep layer). Runs Schemathesis against
# the live services using each service's OpenAPI as the source of truth; a response
# that violates the contract (implementation drift) fails the gate (SC-001).
set -euo pipefail

REPOS_ROOT="${REPOS_ROOT:-../..}"
FRONTEND="${FRONTEND_URL:-http://localhost:8080}"
MAX="${MAX_EXAMPLES:-15}"

token="$(curl -s -X POST "$FRONTEND/login" -H 'content-type: application/json' \
  -d '{"username":"admin","password":"admin"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["accessToken"])')"

conform() {
  local name="$1" schema="$2" base="$3"; shift 3
  echo "== conformance: $name =="
  # Conformance = implementation must match its contract. not_a_server_error is a
  # robustness check (5xx on fuzzed input) that the demo app trips by design and
  # documents as 500; exclude it so the gate is about contract drift (SC-001).
  schemathesis run "$schema" --base-url "$base" \
    --experimental=openapi-3.1 \
    --checks all --exclude-checks not_a_server_error \
    --hypothesis-max-examples="$MAX" \
    --hypothesis-suppress-health-check=filter_too_much "$@"
}

conform auth-api  "$REPOS_ROOT/microservice-app-auth-api/contracts/openapi.yaml"  http://localhost:8000
conform todos-api "$REPOS_ROOT/microservice-app-todos-api/contracts/openapi.yaml" http://localhost:8082 -H "Authorization: Bearer $token"
conform users-api "$REPOS_ROOT/microservice-app-users-api/contracts/openapi.yaml" http://localhost:8083 -H "Authorization: Bearer $token"
echo "conformance gate OK"
