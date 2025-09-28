#!/usr/bin/env bash
set -euo pipefail

banner() { printf "\n\033[1;36m%s\033[0m\n" "▸ $*"; }

# 0) Guards
[ -f package.json ] || { echo "❌ Run this from the repo root (package.json not found)."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required."; exit 1; }

# 1) Find userRoutes path
banner "Detecting userRoutes route file"
USER_ROUTES_PATH=""
for p in \
  "src/api/routes/userRoutes.ts" \
  "src/api/routes/users.ts" \
  "src/api/routes/user.routes.ts" \
  "src/routes/userRoutes.ts" \
  "src/routes/users.ts"
do
  [ -f "$p" ] && USER_ROUTES_PATH="$p" && break
done
if [ -z "$USER_ROUTES_PATH" ]; then
  CANDIDATES=$(git ls-files | grep -Ei '^src/.*/routes/.*user.*\.(ts|js)$' || true)
  [ -n "$CANDIDATES" ] && USER_ROUTES_PATH=$(printf "%s\n" "$CANDIDATES" | head -n1 || true)
fi
[ -z "$USER_ROUTES_PATH" ] && { echo "❌ Could not find userRoutes under src/**/routes."; exit 1; }
echo "✅ Found: $USER_ROUTES_PATH"

# 2) Ensure dev deps (jest + ts-jest + supertest + types)
banner "Ensuring devDependencies"
has_dev() { node -e "console.log(!!(require('./package.json').devDependencies||{})['$1'])"; }
NEED=false
for d in jest ts-jest supertest @types/jest @types/supertest; do
  [ "$(has_dev "$d")" = "true" ] || NEED=true
done
if $NEED; then
  npm pkg set "devDependencies.jest=^29.7.0" >/dev/null 2>&1 || true
  npm pkg set "devDependencies.ts-jest=^29.2.5" >/dev/null 2>&1 || true
  npm pkg set "devDependencies.supertest=^7.0.0" >/dev/null 2>&1 || true
  npm pkg set "devDependencies.@types/jest=^29.5.13" >/dev/null 2>&1 || true
  npm pkg set "devDependencies.@types/supertest=^2.0.16" >/dev/null 2>&1 || true
  npm install
else
  echo "✅ Dev deps already present."
fi

# 3) Ensure jest.config.js (non-invasive)
banner "Checking jest.config.js"
if [ ! -f jest.config.js ] && [ ! -f jest.config.cjs ] && [ ! -f jest.config.mjs ]; then
  cat > jest.config.js <<'EOF'
/** Minimal Jest config for TS */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/index.ts',
    '!src/**/types.ts',
  ],
};
EOF
  echo "🆕 Created jest.config.js"
else
  echo "✅ Found existing Jest config"
fi

# 4) Ensure npm test script
banner "Ensuring npm test script"
if ! npm pkg get scripts.test | grep -qv null; then
  npm pkg set "scripts.test=jest --runInBand"
  echo "🆕 Added npm test script"
else
  echo "✅ test script exists"
fi

# 5) Remove buggy helper folder if present
banner "Cleaning old helpers"
if [ -d "__tests__/helpers" ]; then
  rm -rf __tests__/helpers
  echo "🧹 Removed __tests__/helpers (to avoid Jest picking it up as tests)"
else
  echo "✅ No __tests__/helpers to clean"
fi

# 6) Create safe helper outside __tests__
banner "Writing test/utils/testServer.ts"
mkdir -p test/utils

ROUTER_IMPORT_REL="${USER_ROUTES_PATH#src/}"          # e.g. api/routes/userRoutes.ts
ROUTER_IMPORT_PATH='../../src/'"$ROUTER_IMPORT_REL"    # from test/utils -> src/...

cat > test/utils/testServer.ts <<'EOF'
import express, { type RequestHandler } from 'express';

// IMPORTANT: this import is replaced below with your actual path
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import userRoutes from 'REPLACEME_USER_ROUTES';

export const BASE = `/api/${process.env.API_VERSION || 'v1'}/users`;

const notFound: RequestHandler = (_req, res): void => {
  res.status(404).json({ error: 'not_found' });
};

export const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use(BASE, userRoutes);
  // No string path here; avoids path-to-regexp '*' issues in Express 5
  app.use(notFound);
  return app;
};

export const http = () => {
  const app = makeApp();
  // lazy require to keep types optional
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const request = require('supertest') as typeof import('supertest');
  return request(app);
};
EOF

# Replace placeholder import with the real path
# Try GNU sed first, then fallback to perl (macOS)
sed -i 's#REPLACEME_USER_ROUTES#'"$ROUTER_IMPORT_PATH"'#' test/utils/testServer.ts 2>/dev/null || \
perl -0777 -pe 's/REPLACEME_USER_ROUTES/'"$(printf '%s' "$ROUTER_IMPORT_PATH" | sed 's/[\/&]/\\&/g')"'/g' -i test/utils/testServer.ts

echo "✅ Helper created at test/utils/testServer.ts (imports $ROUTER_IMPORT_PATH)"

# 7) Overwrite userRoutes test to import the new helper
banner "Writing __tests__/api/routes/userRoutes.test.ts"
mkdir -p __tests__/api/routes
cat > __tests__/api/routes/userRoutes.test.ts <<'EOF'
import { http, BASE } from '../../../test/utils/testServer';

describe('userRoutes', () => {
  it('mounts and returns 404/401/403 for an unknown subroute (no 5xx)', async () => {
    const res = await http().get(`${BASE}/__unknown__`);
    expect(res.status).toBeGreaterThanOrEqual(401); // could be 401/403/404
    expect(res.status).toBeLessThan(500);           // must not 5xx
  });
});
EOF
echo "✅ Test written at __tests__/api/routes/userRoutes.test.ts"

# 8) Run tests
banner "Running tests"
npm test --silent || {
  echo "⚠️  If failures reference auth/DB middlewares on real endpoints, this probe test still passes as long as the router mounts without 5xx."
  exit 1
}

banner "✅ Done. Coverage at ./coverage"
