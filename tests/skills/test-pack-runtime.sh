#!/usr/bin/env bash
# Pack runtime contract: pack-bundled resolution, no external adr CLI.
# Runs against an installed .agents/skills layout with a minimal PATH.
set -u

pass=0
fail=0
ok()  { pass=$((pass + 1)); }
bad() { fail=$((fail + 1)); printf '[FAIL] %s\n' "$1"; }

if ! command -v python3 >/dev/null 2>&1; then
  printf 'pack-runtime: SKIP（无 python3；它是技能运行时前提，不是本仓测试前提）\n'
  exit 0
fi
if ! command -v node >/dev/null 2>&1; then
  printf 'pack-runtime: 1 passed, 0 failed\n'
  printf '[FAIL] pack-runtime: node 是本仓测试前提\n' >&2
  exit 1
fi

ORIG_PATH=$PATH
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP="$(mktemp -d)"
TMP="$(cd "$TMP" && pwd -P)"
trap 'PATH=$ORIG_PATH; rm -rf "$TMP"' EXIT
export PYTHONDONTWRITEBYTECODE=1
unset ADRKIT_CLI ADRKIT_FEATURE_DIR ADRKIT_SNAPSHOT ADRKIT_AS_OF
unset SPECIFY_INIT_DIR SPECIFY_FEATURE SPECIFY_FEATURE_DIRECTORY SPECIFY_FEATURE_NO_PERSIST

INSTALL="$TMP/install"
SKILLS="$INSTALL/.agents/skills"
PROJECT="$TMP/project"
mkdir -p "$SKILLS" "$PROJECT/.git" "$PROJECT/docs/memory" "$PROJECT/specs/001-demo"
for skill in ncw-adrkit-check ncw-adrkit-context ncw-adrkit-draft ncw-speckit-analyze; do
  cp -R "$REPO_ROOT/skills/$skill" "$SKILLS/$skill"
done

printf '%s\n' '{"feature_directory":"specs/001-demo"}' > "$PROJECT/docs/memory/feature.json"
printf '# Demo\n' > "$PROJECT/specs/001-demo/spec.md"
cat > "$PROJECT/specs/001-demo/plan.md" <<'EOF'
---
schemaVersion: 0.1.0
id: "0042"
title: A decision titled clearly
date: 2026-07-19
status: proposed
---

# ADR-0042
EOF
printf '%s' '{"schemaVersion":"adrkit.pass0.snapshot/v1"}' > "$TMP/snapshot.json"

# Keep only the host runtimes and POSIX tools used by the wrappers. In
# particular, this directory never contains adr, jq, or git.
mkdir -p "$TMP/bin"
for tool in node python3 dirname mkdir sed head date cat; do
  source="$(command -v "$tool")"
  ln -s "$source" "$TMP/bin/$tool"
done
PATH="$TMP/bin"
export PATH
# Keep the CLI resolution hermetic: an omp-installed adrkit bin under the real
# $HOME must not leak into the bundled-runtime contract.
HOME="$TMP/home"
mkdir -p "$HOME"
export HOME

run() { # run <command...>; captures OUT / RC and writes stderr to $TMP/stderr
  OUT="$(cd "$PROJECT" && "$@" 2>"$TMP/stderr")"
  RC=$?
}

run_with_snapshot() {
  OUT="$(cd "$PROJECT" && ADRKIT_SNAPSHOT="$TMP/snapshot.json" ADRKIT_AS_OF=2026-07-19 "$@" 2>"$TMP/stderr")"
  RC=$?
}

json_matches() { # json_matches <payload> <partial-json>
  node -e '
    const fs = require("node:fs");
    let actual;
    const expected = JSON.parse(process.argv[1]);
    try { actual = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(1); }
    function matches(value, pattern) {
      if (pattern === null || typeof pattern !== "object") return value === pattern;
      if (Array.isArray(pattern)) {
        return Array.isArray(value) && value.length >= pattern.length &&
          pattern.every((entry, index) => matches(value[index], entry));
      }
      return value !== null && typeof value === "object" && !Array.isArray(value) &&
        Object.entries(pattern).every(([key, entry]) => matches(value[key], entry));
    }
    process.exit(matches(actual, expected) ? 0 : 1);
  ' "$2" <<<"$1"
}

command -v adr >/dev/null 2>&1 && bad "fixture: 外部 adr 意外进入最小 PATH" || ok

# Bundled speckit resolution.
run python3 "$SKILLS/ncw-speckit-analyze/scripts/check_prerequisites.py" --json --paths-only
[ "$RC" -eq 0 ] && ok || bad "speckit paths: 退出码 $RC，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" "{\"REPO_ROOT\":\"$PROJECT\",\"FEATURE_DIR\":\"$PROJECT/specs/001-demo\",\"FEATURE_SPEC\":\"$PROJECT/specs/001-demo/spec.md\"}" \
  && ok || bad "speckit paths: JSON 未返回活动 feature 路径：$OUT"

# The bundled CLI and all three adrkit wrappers work without adr on PATH.
EXPECTED_VERSION="$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).version' "$SKILLS/ncw-adrkit-draft/scripts/adrkit-bundle.json")"
run "$SKILLS/ncw-adrkit-draft/scripts/adr.sh" --version
[ "$RC" -eq 0 ] && [ "$OUT" = "$EXPECTED_VERSION" ] && ok || bad "adr version: RC=$RC output=$OUT expected=$EXPECTED_VERSION"

run "$SKILLS/ncw-adrkit-draft/scripts/scaffold.sh" Adopt bundled ADR runtime
[ "$RC" -eq 0 ] && ok || bad "scaffold: 退出码 $RC，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"id":"0001","path":"docs/adr/0001-adopt-bundled-adr-runtime.md"}' \
  && ok || bad "scaffold: 未分配预期 id/path：$OUT"
[ -f "$PROJECT/docs/adr/0001-adopt-bundled-adr-runtime.md" ] && ok || bad "scaffold: 未创建 ADR 文件"

run "$SKILLS/ncw-adrkit-draft/scripts/draft.sh" Record plan decision
[ "$RC" -eq 0 ] && ok || bad "draft: 退出码 $RC，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"id":"0002","path":"docs/adr/0002-record-plan-decision.md"}' \
  && ok || bad "draft: 未通过 bundled speckit resolver 分配下一条 ADR：$OUT"

run "$SKILLS/ncw-adrkit-draft/scripts/adr.sh" lint --json
[ "$RC" -eq 0 ] && ok || bad "lint: 退出码 $RC，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"checked":2}' && ok || bad "lint: checked != 2：$OUT"

run "$SKILLS/ncw-adrkit-check/scripts/check.sh"
[ "$RC" -eq 0 ] && ok || bad "check: 退出码 $RC，stderr: $(<"$TMP/stderr")"
CHECK_JSON="${OUT#*==> adrkit:check}"
CHECK_JSON="${CHECK_JSON#$'\n'}"
json_matches "$CHECK_JSON" '{"ok":true}' && ok || bad "check: CheckOutcome 非 ok：$OUT"

run_with_snapshot "$SKILLS/ncw-adrkit-check/scripts/check.sh"
[ "$RC" -eq 0 ] && ok || bad "evaluate: 退出码 $RC，stderr: $(<"$TMP/stderr")"
EVALUATE_JSON="${OUT##*==> adrkit:evaluate}"
EVALUATE_JSON="${EVALUATE_JSON#$'\n'}"
json_matches "$EVALUATE_JSON" '{"result":{"report":{"outcome":"ok"}}}' \
  && ok || bad "evaluate: 未返回 deterministic ok report：$OUT"

run "$SKILLS/ncw-adrkit-context/scripts/context.sh" specs/001-demo/plan.md
[ "$RC" -eq 0 ] && ok || bad "context paths: 退出码 $RC，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"ok":true}' && ok || bad "context paths: 非 ok：$OUT"

run "$SKILLS/ncw-adrkit-context/scripts/context.sh"
[ "$RC" -eq 0 ] && ok || bad "context queue: 退出码 $RC，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"version":"1"}' && ok || bad "context queue: 非 QueueReport v1：$OUT"

# Migration preserves dry-run behavior and performs a real MADR conversion.
mkdir -p "$TMP/legacy"
cat > "$TMP/legacy/0001-cli.md" <<'EOF'
---
title: Migrate through the CLI
status: proposed
date: 2026-07-18
---
# Migrate through the CLI
EOF
run "$SKILLS/ncw-adrkit-draft/scripts/adr.sh" migrate --from madr --dir "$TMP/legacy" --dry-run --json
[ "$RC" -eq 0 ] && ok || bad "migrate dry-run: 退出码 $RC，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"results":[{"outcome":"migrated"}]}' && ok || bad "migrate dry-run: 结果不符：$OUT"
node -e 'const fs=require("node:fs"); process.exit(fs.readFileSync(process.argv[1],"utf8").includes("schemaVersion")?1:0)' "$TMP/legacy/0001-cli.md" \
  && ok || bad "migrate dry-run: 写入了源文件"

run "$SKILLS/ncw-adrkit-draft/scripts/adr.sh" migrate --from madr --dir "$TMP/legacy" --json
[ "$RC" -eq 0 ] && ok || bad "migrate: 退出码 $RC，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"results":[{"outcome":"migrated"}]}' && ok || bad "migrate: 结果不符：$OUT"
node -e 'const fs=require("node:fs"); process.exit(fs.readFileSync(process.argv[1],"utf8").includes("schemaVersion")?0:1)' "$TMP/legacy/0001-cli.md" \
  && ok || bad "migrate: 未写入 adrkit frontmatter"

printf 'pack-runtime: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
