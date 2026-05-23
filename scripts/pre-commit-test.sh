#!/usr/bin/env sh
set -eu

if [ "${SKIP_TESTS:-}" = "1" ] || [ "${SKIP_API_TESTS:-}" = "1" ]; then
  echo "Tests skipped (SKIP_TESTS or SKIP_API_TESTS=1)."
  exit 0
fi

root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$root"

echo "Running unit tests…"
pnpm test

echo "Running e2e tests…"
pnpm run test:e2e

echo "All tests passed."
