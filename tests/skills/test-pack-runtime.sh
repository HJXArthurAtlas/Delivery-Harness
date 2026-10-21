#!/usr/bin/env bash
# Pack runtime contract: @adrkit/cli and @newchiwan/che resolution.
# Both CLIs are external PATH deps driven like a user install, against an
# installed .agents/skills layout with a minimal PATH.
set -u

pass=0
fail=0
ok()  { pass=$((pass + 1)); }
bad() { fail=$((fail + 1)); printf '[FAIL] %s\n' "$1"; }

if ! command -v node >/dev/null 2>&1; then
  printf 'pack-runtime: 1 passed, 0 failed\n'
  printf '[FAIL] pack-runtime: node 是本仓测试前提\n' >&2
  exit 1
fi

ORIG_PATH=$PATH
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ADRKIT_BIN="$REPO_ROOT/node_modules/.bin/adrkit"
CHE_BIN="$REPO_ROOT/node_modules/.bin/che"
if [ ! -x "$ADRKIT_BIN" ]; then
  printf '[FAIL] pack-runtime: @adrkit/cli 未安装；先运行 npm ci\n' >&2
  exit 1
fi
if [ ! -x "$CHE_BIN" ]; then
  printf '[FAIL] pack-runtime: @newchiwan/che 未安装；先运行 npm ci\n' >&2
  exit 1
fi
TMP="$(mktemp -d)"
TMP="$(cd "$TMP" && pwd -P)"
trap 'PATH=$ORIG_PATH; rm -rf "$TMP"' EXIT
unset ADRKIT_FEATURE_DIR ADRKIT_SNAPSHOT ADRKIT_AS_OF
unset CHE_INIT_DIR CHE_FEATURE CHE_FEATURE_DIRECTORY CHE_FEATURE_NO_PERSIST
unset SPECIFY_INIT_DIR SPECIFY_FEATURE SPECIFY_FEATURE_DIRECTORY SPECIFY_FEATURE_NO_PERSIST

INSTALL="$TMP/install"
SKILLS="$INSTALL/.agents/skills"
PROJECT="$TMP/project"
mkdir -p "$SKILLS" "$PROJECT/.git" "$PROJECT/.che" "$PROJECT/specs/001-demo" "$PROJECT/docs/adr"
for skill in che-adr-check che-adr-context che-adr-draft; do
  cp -R "$REPO_ROOT/skills/$skill" "$SKILLS/$skill"
done

printf '%s\n' '{"feature_directory":"specs/001-demo"}' > "$PROJECT/.che/feature.json"
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

# Keep only the host runtimes and POSIX tools used by the wrappers. The real
# @adrkit/cli is added after exercising the missing-CLI contract; jq and git
# remain absent.
mkdir -p "$TMP/bin"
for tool in node dirname mkdir sed head date cat ln; do
  source="$(command -v "$tool")"
  ln -s "$source" "$TMP/bin/$tool"
done
PATH="$TMP/bin"
export PATH
# Keep user-level state hermetic during CLI operations.
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

command -v adrkit >/dev/null 2>&1 && bad "fixture: 外部 adrkit 意外进入最小 PATH" || ok
run "$SKILLS/che-adr-draft/scripts/adr.sh" --version
[ "$RC" -eq 1 ] && ok || bad "missing CLI: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"npm install -g @adrkit/cli@0.20.0"*) ok ;;
  *) bad "missing CLI: 未提示 npm 安装：$(<"$TMP/stderr")" ;;
esac
ln -s "$ADRKIT_BIN" "$TMP/bin/adrkit"
command -v adrkit >/dev/null 2>&1 && ok || bad "fixture: 无法把真实 @adrkit/cli 加入 PATH"

# Missing-che contract: draft.sh checks corpus → plan → feature dir, so the
# missing `che` failure surfaces here before any write.
command -v che >/dev/null 2>&1 && bad "fixture: 外部 che 意外进入最小 PATH" || ok
run "$SKILLS/che-adr-draft/scripts/draft.sh" Probe
[ "$RC" -eq 1 ] && ok || bad "missing che: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"npm install -g @newchiwan/che@0.1.0"*) ok ;;
  *) bad "missing che: 未提示 npm 安装：$(<"$TMP/stderr")" ;;
esac
ln -s "$CHE_BIN" "$TMP/bin/che"
command -v che >/dev/null 2>&1 && ok || bad "fixture: 无法把真实 @newchiwan/che 加入 PATH"

# Feature resolution through the external che CLI.
run che paths --json
[ "$RC" -eq 0 ] && ok || bad "che paths: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" "{\"REPO_ROOT\":\"$PROJECT\",\"FEATURE_DIR\":\"$PROJECT/specs/001-demo\",\"FEATURE_SPEC\":\"$PROJECT/specs/001-demo/spec.md\"}" \
  && ok || bad "che paths: JSON 未返回活动 feature 路径：$OUT"

# The real @adrkit/cli and all three wrappers work through PATH resolution.
EXPECTED_VERSION="$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).dependencies["@adrkit/cli"]' "$REPO_ROOT/package.json")"
run "$SKILLS/che-adr-draft/scripts/adr.sh" --version
[ "$RC" -eq 0 ] && [ "$OUT" = "$EXPECTED_VERSION" ] && ok || bad "adr version: RC=$RC output=$OUT expected=$EXPECTED_VERSION"

run "$SKILLS/che-adr-draft/scripts/scaffold.sh" Adopt npm ADR runtime
[ "$RC" -eq 0 ] && ok || bad "scaffold: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"id":"0001","path":"docs/adr/0001-adopt-npm-adr-runtime.md"}' \
  && ok || bad "scaffold: 未分配预期 id/path：$OUT"
[ -f "$PROJECT/docs/adr/0001-adopt-npm-adr-runtime.md" ] && ok || bad "scaffold: 未创建 ADR 文件"

run "$SKILLS/che-adr-draft/scripts/draft.sh" Record plan decision
[ "$RC" -eq 0 ] && ok || bad "draft: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"id":"0002","path":"docs/adr/0002-record-plan-decision.md"}' \
  && ok || bad "draft: 未通过 bundled speckit resolver 分配下一条 ADR：$OUT"

run "$SKILLS/che-adr-draft/scripts/adr.sh" lint --json
[ "$RC" -eq 0 ] && ok || bad "lint: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"checked":2}' && ok || bad "lint: checked != 2：$OUT"

run "$SKILLS/che-adr-check/scripts/check.sh"
[ "$RC" -eq 0 ] && ok || bad "check: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
CHECK_JSON="${OUT#*==> adrkit:check}"
CHECK_JSON="${CHECK_JSON#$'\n'}"
json_matches "$CHECK_JSON" '{"ok":true}' && ok || bad "check: CheckOutcome 非 ok：$OUT"

run_with_snapshot "$SKILLS/che-adr-check/scripts/check.sh"
[ "$RC" -eq 0 ] && ok || bad "evaluate: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
EVALUATE_JSON="${OUT##*==> adrkit:evaluate}"
EVALUATE_JSON="${EVALUATE_JSON#$'\n'}"
json_matches "$EVALUATE_JSON" '{"result":{"report":{"outcome":"ok"}}}' \
  && ok || bad "evaluate: 未返回 deterministic ok report：$OUT"

run "$SKILLS/che-adr-context/scripts/context.sh" specs/001-demo/plan.md
[ "$RC" -eq 0 ] && ok || bad "context paths: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"ok":true}' && ok || bad "context paths: 非 ok：$OUT"

run "$SKILLS/che-adr-context/scripts/context.sh"
[ "$RC" -eq 0 ] && ok || bad "context queue: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
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
run "$SKILLS/che-adr-draft/scripts/adr.sh" migrate --from madr --dir "$TMP/legacy" --dry-run --json
[ "$RC" -eq 0 ] && ok || bad "migrate dry-run: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"results":[{"outcome":"migrated"}]}' && ok || bad "migrate dry-run: 结果不符：$OUT"
node -e 'const fs=require("node:fs"); process.exit(fs.readFileSync(process.argv[1],"utf8").includes("schemaVersion")?1:0)' "$TMP/legacy/0001-cli.md" \
  && ok || bad "migrate dry-run: 写入了源文件"

run "$SKILLS/che-adr-draft/scripts/adr.sh" migrate --from madr --dir "$TMP/legacy" --json
[ "$RC" -eq 0 ] && ok || bad "migrate: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"results":[{"outcome":"migrated"}]}' && ok || bad "migrate: 结果不符：$OUT"
node -e 'const fs=require("node:fs"); process.exit(fs.readFileSync(process.argv[1],"utf8").includes("schemaVersion")?0:1)' "$TMP/legacy/0001-cli.md" \
  && ok || bad "migrate: 未写入 adrkit frontmatter"

printf 'pack-runtime: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
