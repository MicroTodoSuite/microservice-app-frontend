#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dockerfile="$repo_root/Dockerfile"

grep -Fq 'libexpat=2.8.4-r0' "$dockerfile" || {
  echo "runtime-security-contract: libexpat must include the Alpine security fixes" >&2
  exit 1
}
grep -Fq 'libuuid=2.41.6-r1' "$dockerfile" || {
  echo "runtime-security-contract: libuuid must include the Alpine security fixes" >&2
  exit 1
}

echo "runtime-security-contract: PASS"
