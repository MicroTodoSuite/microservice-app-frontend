#!/usr/bin/env bash
# Unit gate entrypoint (spec 006 / T014) consumed by the reusable CI `unit` job.
# --ignore-scripts skips the legacy node-sass native build (webpack-only; Jest
# does not need it), so the unit gate is independent of the fragile asset
# toolchain. jest.config.js enforces the 70% threshold over the Vuex store.
set -euo pipefail
npm ci --ignore-scripts
npx jest --coverage
