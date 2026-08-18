# Performance baseline (spec 007 / US4)

The perf gate (`locustfile.py`) fails when either:

- any request errors (failure ratio > 0), or
- p95 latency exceeds `P95_THRESHOLD_MS` (default **800 ms**), overridable per run.

Scenarios: `/login` (POST), `/todos` (GET, POST) through the frontend proxy.
Run headless via the reusable `stack-tests` workflow (nightly) against the full
compose stack. Adjust the threshold here as the baseline is re-measured.
