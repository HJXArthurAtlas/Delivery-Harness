#!/usr/bin/env bash
# che CLI contract: feature pointer, paths resolution, template/setup parity.
# Drives the repo-local @newchiwan/che via node_modules/.bin (npm install).
set -u

pass=0
fail=0
ok()  { pass=$((pass + 1)); }
bad() { fail=$((fail + 1)); printf '[FAIL] %s\n' "$1"; }

if ! command -v node >/dev/null 2>&1; then
  printf 'che-cli: 1 passed, 0 failed\n'
  printf '[FAIL] che-cli: node 是本仓测试前提\n' >&2
  exit 1
fi
if ! node -e 'process.exit(process.features.typescript ? 0 : 1)' 2>/dev/null; then
  printf 'che-cli: SKIP（本机 Node 无原生 type stripping，无法运行 @newchiwan/che）\n'
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHE_BIN="$REPO_ROOT/node_modules/.bin/che"
if [ ! -x "$CHE_BIN" ]; then
  printf 'che-cli: 1 passed, 0 failed\n'
  printf '[FAIL] che-cli: 未找到 node_modules/.bin/che —— 先运行 npm ci\n' >&2
  exit 1
fi

TMP="$(mktemp -d)"
TMP="$(cd "$TMP" && pwd -P)"
trap 'rm -rf "$TMP"' EXIT
unset CHE_INIT_DIR CHE_FEATURE CHE_FEATURE_DIRECTORY CHE_FEATURE_NO_PERSIST CHE_REQUIRE_INTENT
unset SPECIFY_INIT_DIR SPECIFY_FEATURE SPECIFY_FEATURE_DIRECTORY SPECIFY_FEATURE_NO_PERSIST
unset ADRKIT_FEATURE_DIR ADRKIT_DIR ADRKIT_SNAPSHOT ADRKIT_AS_OF

PROJECT="$TMP/project"
mkdir -p "$PROJECT/.git" "$PROJECT/.che" "$PROJECT/specs/001-demo"
printf '%s\n' '{"feature_directory":"specs/001-demo"}' > "$PROJECT/.che/feature.json"
printf '# Demo\n' > "$PROJECT/specs/001-demo/spec.md"

run() { # run <command...>; captures OUT / RC and writes stderr to $TMP/stderr
  OUT="$(cd "$PROJECT" && "$@" 2>"$TMP/stderr")"
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

byte_equal() { # byte_equal <file> <file>
  cmp -s "$1" "$2"
}

# 1. paths --json resolves the stored pointer to absolute paths.
run "$CHE_BIN" paths --json
[ "$RC" -eq 0 ] && ok || bad "paths --json: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" "{\"REPO_ROOT\":\"$PROJECT\",\"BRANCH\":\"001-demo\",\"FEATURE_DIR\":\"$PROJECT/specs/001-demo\",\"FEATURE_SPEC\":\"$PROJECT/specs/001-demo/spec.md\",\"IMPL_PLAN\":\"$PROJECT/specs/001-demo/plan.md\",\"TASKS\":\"$PROJECT/specs/001-demo/tasks.md\"}" \
  && ok || bad "paths --json: 未返回活动 feature 路径：$OUT"

# 2. paths text keeps the `FEATURE_DIR: <value>` line (adrkit-lib.sh parses it).
run "$CHE_BIN" paths
[ "$RC" -eq 0 ] && ok || bad "paths text: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf '%s\n' "$OUT" | grep -qx "FEATURE_DIR: $PROJECT/specs/001-demo" \
  && ok || bad "paths text: 缺少 FEATURE_DIR 行：$OUT"

# 3. Pointer absent + no env → resolution error naming the specify command.
rm "$PROJECT/.che/feature.json"
run "$CHE_BIN" paths
[ "$RC" -eq 1 ] && ok || bad "paths 无指针: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"run the specify command to create .che/feature.json"*) ok ;;
  *) bad "paths 无指针: stderr 未提示 specify：$(<"$TMP/stderr")" ;;
esac

# 4. che check persists CHE_FEATURE_DIRECTORY unless CHE_FEATURE_NO_PERSIST.
mkdir -p "$PROJECT/specs/002-env" && printf '# Env\n' > "$PROJECT/specs/002-env/plan.md"
printf '# Demo\n' > "$PROJECT/specs/001-demo/plan.md"
printf '%s\n' '{"feature_directory":"specs/001-demo"}' > "$PROJECT/.che/feature.json"
run env CHE_FEATURE_DIRECTORY=specs/002-env "$CHE_BIN" check --json
[ "$RC" -eq 0 ] && ok || bad "check 持久化: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
[ "$(<"$PROJECT/.che/feature.json")" = '{"feature_directory":"specs/002-env"}' ] \
  && ok || bad "check 持久化: 指针未改写为 specs/002-env：$(<"$PROJECT/.che/feature.json")"
run env CHE_FEATURE_DIRECTORY=specs/001-demo CHE_FEATURE_NO_PERSIST=1 "$CHE_BIN" check --json
[ "$RC" -eq 0 ] && ok || bad "check no-persist: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
[ "$(<"$PROJECT/.che/feature.json")" = '{"feature_directory":"specs/002-env"}' ] \
  && ok || bad "check no-persist: 指针被改写：$(<"$PROJECT/.che/feature.json")"

# 5. --require-tasks fails when tasks.md is absent.
run "$CHE_BIN" check --json --require-tasks
[ "$RC" -eq 1 ] && ok || bad "require-tasks: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"ERROR: tasks.md not found"*) ok ;;
  *) bad "require-tasks: stderr 未报 tasks.md：$(<"$TMP/stderr")" ;;
esac

# 6. feature set writes exact bytes; identical rewrite is a no-op.
run "$CHE_BIN" feature set specs/003-x
[ "$RC" -eq 0 ] && ok || bad "feature set: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf '%s' '{"feature_directory":"specs/003-x"}
' | cmp -s - "$PROJECT/.che/feature.json" \
  && ok || bad "feature set: 指针字节不符：$(<"$PROJECT/.che/feature.json")"
_before="$(md5 -q "$PROJECT/.che/feature.json")"
run "$CHE_BIN" feature set specs/003-x
[ "$RC" -eq 0 ] && [ "$(md5 -q "$PROJECT/.che/feature.json")" = "$_before" ] \
  && ok || bad "feature set 重写: 相同值被改写"

# 7. feature show prints the stored value.
run "$CHE_BIN" feature show
[ "$RC" -eq 0 ] && [ "$OUT" = 'specs/003-x' ] && ok || bad "feature show: RC=$RC OUT=$OUT"

# 8. template resolves bundled references/ byte-exact; unsafe/missing names fail.
CONSTITUTION_REFS="$REPO_ROOT/skills/che-compound-constitution/references"
run "$CHE_BIN" template constitution-template --json --references-dir "$CONSTITUTION_REFS"
[ "$RC" -eq 0 ] && ok || bad "template: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
node -e '
  const fs = require("node:fs");
  let payload;
  try { payload = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(1); }
  if (payload.TEMPLATE_NAME !== "constitution-template") process.exit(1);
  process.exit(payload.TEMPLATE_CONTENT === fs.readFileSync(process.argv[1], "utf8") ? 0 : 1);
' "$CONSTITUTION_REFS/constitution-template.md" <<<"$OUT" \
  && ok || bad "template: TEMPLATE_CONTENT 与 references/constitution-template.md 非字节一致"
run "$CHE_BIN" template ../etc --json --references-dir "$CONSTITUTION_REFS"
[ "$RC" -ne 0 ] && case "$(<"$TMP/stderr")" in *"Could not resolve required"*) ok ;; *) bad "template unsafe: 错误信息不符：$(<"$TMP/stderr")" ;; esac \
  || bad "template unsafe: 退出码 ${RC}，预期非 0"
run "$CHE_BIN" template no-such-template --json --references-dir "$CONSTITUTION_REFS"
[ "$RC" -ne 0 ] && case "$(<"$TMP/stderr")" in *"Could not resolve required"*) ok ;; *) bad "template missing: 错误信息不符：$(<"$TMP/stderr")" ;; esac \
  || bad "template missing: 退出码 ${RC}，预期非 0"
run "$CHE_BIN" template constitution-template --json
[ "$RC" -eq 2 ] && ok || bad "template 缺 --references-dir: 退出码 ${RC}，预期 2"

# 9. setup-plan copies plan-template byte-exact; rerun skips without touching it.
PLAN_REFS="$REPO_ROOT/skills/che-compound-plan/references"
rm "$PROJECT/specs/001-demo/plan.md"
printf '%s\n' '{"feature_directory":"specs/001-demo"}' > "$PROJECT/.che/feature.json"
run "$CHE_BIN" setup-plan --json --references-dir "$PLAN_REFS"
[ "$RC" -eq 0 ] && ok || bad "setup-plan: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
byte_equal "$PROJECT/specs/001-demo/plan.md" "$PLAN_REFS/plan-template.md" \
  && ok || bad "setup-plan: plan.md 与 plan-template.md 非字节一致"
json_matches "$OUT" "{\"IMPL_PLAN\":\"$PROJECT/specs/001-demo/plan.md\"}" \
  && ok || bad "setup-plan: JSON 缺 IMPL_PLAN：$OUT"
run "$CHE_BIN" setup-plan --json --references-dir "$PLAN_REFS"
[ "$RC" -eq 0 ] && ok || bad "setup-plan 重跑: 退出码 ${RC}"
case "$(<"$TMP/stderr")" in
  *"Plan already exists"*) ok ;;
  *) bad "setup-plan 重跑: stderr 未提示已存在：$(<"$TMP/stderr")" ;;
esac
byte_equal "$PROJECT/specs/001-demo/plan.md" "$PLAN_REFS/plan-template.md" \
  && ok || bad "setup-plan 重跑: plan.md 被改动"

# 10. setup-tasks requires plan.md; otherwise resolves tasks-template byte-exact.
TASKS_REFS="$REPO_ROOT/skills/che-compound-tasks/references"
rm "$PROJECT/specs/001-demo/plan.md"
run "$CHE_BIN" setup-tasks --json --references-dir "$TASKS_REFS"
[ "$RC" -eq 1 ] && ok || bad "setup-tasks 无 plan: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"ERROR: plan.md not found"*) ok ;;
  *) bad "setup-tasks 无 plan: stderr 未报 plan.md：$(<"$TMP/stderr")" ;;
esac
printf '# Plan\n' > "$PROJECT/specs/001-demo/plan.md"
run "$CHE_BIN" setup-tasks --json --references-dir "$TASKS_REFS"
[ "$RC" -eq 0 ] && ok || bad "setup-tasks: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
node -e '
  const fs = require("node:fs");
  let payload;
  try { payload = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(1); }
  process.exit(payload.TASKS_TEMPLATE_CONTENT === fs.readFileSync(process.argv[1], "utf8") ? 0 : 1);
' "$TASKS_REFS/tasks-template.md" <<<"$OUT" \
  && ok || bad "setup-tasks: TASKS_TEMPLATE_CONTENT 与 references/tasks-template.md 非字节一致"

# 11. require-intent gate: default on; toggle via env / .che/config.yml.
# PROJECT has no docs/intents yet → gate closed by default.
run "$CHE_BIN" require-intent
[ "$RC" -eq 1 ] && ok || bad "require-intent 默认拦截: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"No intent docs found"*) ok ;;
  *) bad "require-intent 默认拦截: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

run "$CHE_BIN" require-intent --json
[ "$RC" -eq 1 ] && ok || bad "require-intent --json 拦截: 退出码 ${RC}，预期 1"
json_matches "$OUT" "{\"REPO_ROOT\":\"$PROJECT\",\"GATE\":\"on\",\"INTENT_DIR\":\"$PROJECT/docs/intents\",\"INTENT_COUNT\":0}" \
  && ok || bad "require-intent --json: 状态不符：$OUT"

mkdir -p "$PROJECT/docs/intents"
run "$CHE_BIN" require-intent
[ "$RC" -eq 1 ] && ok || bad "require-intent 空目录: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"no *.intent.md files"*) ok ;;
  *) bad "require-intent 空目录: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

printf '# Intent\n' > "$PROJECT/docs/intents/demo.intent.md"
run "$CHE_BIN" require-intent --json
[ "$RC" -eq 0 ] && ok || bad "require-intent 放行: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"GATE":"on","INTENT_COUNT":1}' \
  && ok || bad "require-intent 放行: 状态不符：$OUT"

# Toggle off via env: silent pass, even with the intent doc removed.
rm "$PROJECT/docs/intents/demo.intent.md"
run env CHE_REQUIRE_INTENT=off "$CHE_BIN" require-intent
[ "$RC" -eq 0 ] && [ -z "$OUT" ] && ok || bad "require-intent env off: RC=$RC OUT=$OUT，预期静默退 0"
run env CHE_REQUIRE_INTENT=off "$CHE_BIN" require-intent --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"GATE":"off","INTENT_COUNT":0}' \
  && ok || bad "require-intent env off --json: RC=$RC OUT=$OUT"

# Toggle via .che/config.yml; env beats config.
printf 'require_intent: off\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" require-intent
[ "$RC" -eq 0 ] && ok || bad "require-intent config off: 退出码 ${RC}，预期 0"
run env CHE_REQUIRE_INTENT=on "$CHE_BIN" require-intent
[ "$RC" -eq 1 ] && ok || bad "require-intent env 优先于 config: 退出码 ${RC}，预期 1"
printf 'require_intent: on\n' > "$PROJECT/.che/config.yml"
run env CHE_REQUIRE_INTENT=off "$CHE_BIN" require-intent
[ "$RC" -eq 0 ] && ok || bad "require-intent env off 优先于 config on: 退出码 ${RC}，预期 0"
printf 'require_intent: maybe\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" require-intent
[ "$RC" -eq 1 ] && ok || bad "require-intent 非法值: 退出码 ${RC}，预期 fail-closed 1"
case "$(<"$TMP/stderr")" in
  *'invalid require_intent toggle "maybe"'*) ok ;;
  *) bad "require-intent 非法值: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
rm "$PROJECT/.che/config.yml"

# Outside a project: hard error.
OUT="$(cd "$TMP" && "$CHE_BIN" require-intent 2>"$TMP/stderr")"
RC=$?
[ "$RC" -eq 1 ] && ok || bad "require-intent 非项目目录: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"not in an SDD project"*) ok ;;
  *) bad "require-intent 非项目目录: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

run "$CHE_BIN" require-intent --help
[ "$RC" -eq 0 ] && ok || bad "require-intent --help: 退出码 ${RC}"
run "$CHE_BIN" require-intent --bogus
[ "$RC" -eq 2 ] && ok || bad "require-intent 未知参数: 退出码 ${RC}，预期 2"

# 12. version parity, help, unknown command.
EXPECTED_VERSION="$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).version' "$REPO_ROOT/packages/cli/package.json")"
run "$CHE_BIN" --version
[ "$RC" -eq 0 ] && [ "$OUT" = "$EXPECTED_VERSION" ] \
  && ok || bad "--version: RC=$RC OUT=$OUT expected=$EXPECTED_VERSION"
run "$CHE_BIN" --help
[ "$RC" -eq 0 ] && ok || bad "--help: 退出码 ${RC}"
run "$CHE_BIN" no-such-command
[ "$RC" -eq 2 ] && ok || bad "未知命令: 退出码 ${RC}，预期 2"

printf 'che-cli: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
