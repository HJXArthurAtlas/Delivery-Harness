#!/usr/bin/env bash
# Publish @newchiwan/che to npm registry as plain-JS artifact.
#
# Why: Node refuses type-stripping for files under node_modules, so the
# repo flow (bin -> src/index.ts, consumed through the file: symlink whose
# realpath escapes node_modules) cannot be shipped verbatim. The published
# tarball therefore carries a single bun-bundled dist/cli.js and nothing else.
#
# Usage: bash scripts/publish.sh [--registry <url>] [extra npm publish flags]
set -euo pipefail
cd "$(dirname "$0")/.."

bun build src/index.ts --target=node --outfile dist/cli.js >/dev/null
chmod +x dist/cli.js
node dist/cli.js --version >/dev/null   # bundle smoke: must run plain

stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT
node -e '
  const { readFileSync, writeFileSync, copyFileSync } = require("node:fs");
  const [stage] = process.argv.slice(1);
  const p = JSON.parse(readFileSync("package.json", "utf8"));
  delete p.scripts;
  delete p.publishConfig;
  delete p.files;
  p.bin = { che: "./cli.js" };
  writeFileSync(stage + "/package.json", JSON.stringify(p, null, 2) + "\n");
  copyFileSync("dist/cli.js", stage + "/cli.js");
' "$stage"

npm publish "$stage" "$@"
