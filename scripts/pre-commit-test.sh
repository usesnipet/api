#!/usr/bin/env sh
set -eu

if [ "${SKIP_TESTS:-}" = "1" ] || [ "${SKIP_API_TESTS:-}" = "1" ]; then
  echo "Testes ignorados (SKIP_TESTS ou SKIP_API_TESTS=1)."
  exit 0
fi

root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$root"

echo "Executando testes unitários…"
pnpm test

echo "Executando testes e2e…"
pnpm run test:e2e

echo "Todos os testes passaram."
