#!/usr/bin/env bash
# che CLI contract: task create, session bindings, resolution order, template/setup parity.
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
unset CHE_INIT_DIR CHE_FEATURE CHE_FEATURE_DIRECTORY CHE_SESSION_ID CHE_REQUIRE_INTENT SKC_PLANVERIFY_GATE
unset SPECIFY_INIT_DIR SPECIFY_FEATURE SPECIFY_FEATURE_DIRECTORY SPECIFY_FEATURE_NO_PERSIST
unset ADRKIT_FEATURE_DIR ADRKIT_DIR ADRKIT_SNAPSHOT ADRKIT_AS_OF

PROJECT="$TMP/project"
mkdir -p "$PROJECT/.git"

PROJECT2="$TMP/project2"
mkdir -p "$PROJECT2/.git"

run() { # run <command...>; captures OUT / RC and writes stderr to $TMP/stderr
  OUT="$(cd "$PROJECT" && "$@" 2>"$TMP/stderr")"
  RC=$?
}

run2() { # run2 <command...>; same as run() but in PROJECT2
  OUT="$(cd "$PROJECT2" && "$@" 2>"$TMP/stderr")"
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

# 1. No tasks yet → resolution error naming task create / intent.
run "$CHE_BIN" paths
[ "$RC" -eq 1 ] && ok || bad "paths 无任务: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"No task directories found under specs/"*) ok ;;
  *) bad "paths 无任务: stderr 未提示创建任务：$(<"$TMP/stderr")" ;;
esac

# 2. task create: allocates 001, writes metadata skeleton, binds session.
run "$CHE_BIN" task create demo --session s1
[ "$RC" -eq 0 ] && ok || bad "task create: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf '%s\n' "$OUT" | grep -qx "TASK_DIR: $PROJECT/specs/001-demo" \
  && ok || bad "task create: 缺少 TASK_DIR 行：$OUT"
printf '%s\n' "$OUT" | grep -qx "SLUG: demo" \
  && ok || bad "task create: 缺少 SLUG 行：$OUT"
printf '%s\n' "$OUT" | grep -qx "BOUND: s1 -> demo" \
  && ok || bad "task create: 缺少 BOUND 行：$OUT"
[ -f "$PROJECT/specs/001-demo/metadata.json" ] \
  && ok || bad "task create: metadata.json 未创建"
node -e '
  const fs = require("node:fs");
  const raw = fs.readFileSync(process.argv[1], "utf8");
  const data = JSON.parse(raw);
  if (data.slug !== "demo") process.exit(1);
  if (typeof data.created_at !== "string" || Number.isNaN(Date.parse(data.created_at))) process.exit(1);
  if (JSON.stringify(data.runs) !== "{}") process.exit(1);
  process.exit(raw.endsWith("\n") && raw.split("\n").length === 2 ? 0 : 1);
' "$PROJECT/specs/001-demo/metadata.json" \
  && ok || bad "task create: metadata.json 结构不符"

# 3. task create --json: NUMBER reflects numeric prefixes only.
run "$CHE_BIN" task create payment --session s2 --json
[ "$RC" -eq 0 ] && ok || bad "task create --json: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" "{\"TASK_DIR\":\"$PROJECT/specs/002-payment\",\"SLUG\":\"payment\",\"NUMBER\":2,\"BOUND\":true}" \
  && ok || bad "task create --json: 输出不符：$OUT"

# 4. create rejects duplicate slug (rc 1, lists dir) and invalid slug (rc 2).
run "$CHE_BIN" task create demo
[ "$RC" -eq 1 ] && ok || bad "task create 重复 slug: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"slug 'demo' already exists"*) ok ;;
  *) bad "task create 重复 slug: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
run "$CHE_BIN" task create Bad_Slug
[ "$RC" -eq 2 ] && ok || bad "task create 非法 slug: 退出码 ${RC}，预期 2"
run "$CHE_BIN" task create
[ "$RC" -eq 2 ] && ok || bad "task create 缺 slug: 退出码 ${RC}，预期 2"
run "$CHE_BIN" task frobnicate
[ "$RC" -eq 2 ] && ok || bad "task 未知子命令: 退出码 ${RC}，预期 2"

# 5. numbering skips numeric prefixes; identifier dirs don't shift numbering.
mkdir -p "$PROJECT/specs/005-manual"
run "$CHE_BIN" task create extra
[ "$RC" -eq 0 ] && ok || bad "task create 序号: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
[ -d "$PROJECT/specs/006-extra" ] \
  && ok || bad "task create 序号: 未跳过 005（应为 006-extra）"
run "$CHE_BIN" task create bonus --session s3 --json
json_matches "$OUT" '{"NUMBER":7,"SLUG":"bonus","BOUND":true}' \
  && ok || bad "task create bonus: 序号应接续 006 → 7：$OUT"

# 6. paths resolves via session binding: json + text contract (adrkit-lib parses).
run "$CHE_BIN" paths --session s1 --json
[ "$RC" -eq 0 ] && ok || bad "paths session --json: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" "{\"REPO_ROOT\":\"$PROJECT\",\"BRANCH\":\"001-demo\",\"SLUG\":\"demo\",\"FEATURE_DIR\":\"$PROJECT/specs/001-demo\",\"FEATURE_SPEC\":\"$PROJECT/specs/001-demo/spec.md\",\"IMPL_PLAN\":\"$PROJECT/specs/001-demo/plan.md\",\"TASKS\":\"$PROJECT/specs/001-demo/tasks.md\"}" \
  && ok || bad "paths session --json: 路径不符：$OUT"
run "$CHE_BIN" paths --session s1
[ "$RC" -eq 0 ] && ok || bad "paths session text: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf '%s\n' "$OUT" | grep -qx "FEATURE_DIR: $PROJECT/specs/001-demo" \
  && ok || bad "paths session text: 缺少 FEATURE_DIR 行：$OUT"
printf '%s\n' "$OUT" | grep -qx "SLUG: demo" \
  && ok || bad "paths session text: 缺少 SLUG 行：$OUT"

# 7. CHE_SESSION_ID env fallback (adrkit wrappers call bare `che paths`).
run env CHE_SESSION_ID=s1 "$CHE_BIN" paths --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"SLUG":"demo"}' \
  && ok || bad "paths CHE_SESSION_ID env: RC=$RC OUT=$OUT"

# 8. Push-time rename is transparent: binding stores the slug, not the path.
mv "$PROJECT/specs/001-demo" "$PROJECT/specs/NCW-4921-demo"
run "$CHE_BIN" paths --session s1 --json
[ "$RC" -eq 0 ] && ok || bad "paths 改名后: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" "{\"SLUG\":\"demo\",\"FEATURE_DIR\":\"$PROJECT/specs/NCW-4921-demo\",\"BRANCH\":\"NCW-4921-demo\"}" \
  && ok || bad "paths 改名后: 未解析到 NCW-4921-demo：$OUT"

# 9. Resolution order: --feature > env > session; identifier dir name resolves too.
run env CHE_FEATURE_DIRECTORY=specs/002-payment "$CHE_BIN" paths --feature demo --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"SLUG":"demo"}' \
  && ok || bad "解析序 --feature 优先于 env: RC=$RC OUT=$OUT"
run env CHE_FEATURE_DIRECTORY=specs/002-payment "$CHE_BIN" paths --session s1 --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"SLUG":"payment"}' \
  && ok || bad "解析序 env 优先于 session: RC=$RC OUT=$OUT"
run "$CHE_BIN" paths --feature specs/002-payment --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"SLUG":"payment"}' \
  && ok || bad "解析序 --feature 路径形态: RC=$RC OUT=$OUT"
run "$CHE_BIN" paths --feature NCW-4921-demo --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"SLUG":"demo"}' \
  && ok || bad "解析序 identifier 目录名: RC=$RC OUT=$OUT"

# 10. Unknown slug / unbound session → error listing existing tasks.
run "$CHE_BIN" paths --feature ghost
[ "$RC" -eq 1 ] && ok || bad "paths 未知 slug: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"no task matches 'ghost'"*) ok ;;
  *) bad "paths 未知 slug: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
run "$CHE_BIN" paths --session ghost
[ "$RC" -eq 1 ] && ok || bad "paths 未绑定 session: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"session 'ghost' is not bound"*) ok ;;
  *) bad "paths 未绑定 session: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

# 11. Ambiguity: no session/feature and multiple tasks → list slug + dir + stage.
run "$CHE_BIN" paths
[ "$RC" -eq 1 ] && ok || bad "paths 多任务歧义: 退出码 ${RC}，预期 1"
_stderr="$(<"$TMP/stderr")"
case "$_stderr" in
  *"Multiple tasks in flight and no session binding"*) ok ;;
  *) bad "paths 多任务歧义: 错误信息不符：$_stderr" ;;
esac
printf '%s\n' "$_stderr" | grep -q -- "- demo  (NCW-4921-demo, stage: created)" \
  && ok || bad "paths 多任务歧义: 候选列表缺 demo：$_stderr"

# 12. feature bind: idempotent same-value; rebind overwrites; clear is idempotent.
run "$CHE_BIN" feature bind payment --session s4
[ "$RC" -eq 0 ] && ok || bad "feature bind: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
_before="$(md5 -q "$PROJECT/.che/feature.json")"
run "$CHE_BIN" feature bind payment --session s4
[ "$RC" -eq 0 ] && [ "$(md5 -q "$PROJECT/.che/feature.json")" = "$_before" ] \
  && ok || bad "feature bind 幂等: 相同绑定被改写"
run "$CHE_BIN" feature bind manual --session s4
[ "$RC" -eq 0 ] && ok || bad "feature bind 重绑: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const keys = Object.keys(data.bindings);
  if (keys.join(",") !== [...keys].sort().join(",")) process.exit(1); // sorted keys
  if (data.bindings.s4.slug !== "manual") process.exit(1);
  if (typeof data.bindings.s4.bound_at !== "string") process.exit(1);
  const raw = fs.readFileSync(process.argv[1], "utf8");
  process.exit(raw.endsWith("\n") && raw.split("\n").length === 2 ? 0 : 1);
' "$PROJECT/.che/feature.json" \
  && ok || bad "feature bind: feature.json 结构/键序不符"
run "$CHE_BIN" feature bind --clear --session s4
[ "$RC" -eq 0 ] && ok || bad "feature bind --clear: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
run "$CHE_BIN" feature bind --clear --session s4
[ "$RC" -eq 0 ] && ok || bad "feature bind --clear 幂等: 退出码 ${RC}，预期 0"
run "$CHE_BIN" feature bind no-such --session s4
[ "$RC" -eq 1 ] && ok || bad "feature bind 未知 slug: 退出码 ${RC}，预期 1"
run "$CHE_BIN" feature bind payment
[ "$RC" -eq 2 ] && ok || bad "feature bind 缺 --session: 退出码 ${RC}，预期 2"

# 13. feature show: all bindings / one session / missing session.
run "$CHE_BIN" feature show --session s2
[ "$RC" -eq 0 ] && ok || bad "feature show --session: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf '%s\n' "$OUT" | grep -qx "SLUG: payment" \
  && ok || bad "feature show --session: 缺 SLUG 行：$OUT"
run "$CHE_BIN" feature show --session s2 --json
json_matches "$OUT" '{"SESSION":"s2","SLUG":"payment"}' \
  && ok || bad "feature show --session --json: 输出不符：$OUT"
run "$CHE_BIN" feature show --json
json_matches "$OUT" '{"bindings":{"s1":{"slug":"demo"},"s2":{"slug":"payment"},"s3":{"slug":"bonus"}}}' \
  && ok || bad "feature show --json: 绑定表不符：$OUT"
run "$CHE_BIN" feature show --session ghost
[ "$RC" -eq 1 ] && ok || bad "feature show 未绑定: 退出码 ${RC}，预期 1"

# 14. Single task, no session → auto-resolve (project2).
run2 "$CHE_BIN" task create solo
[ "$RC" -eq 0 ] && ok || bad "project2 task create: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
run2 "$CHE_BIN" paths --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"SLUG":"solo"}' \
  && ok || bad "project2 单任务自动解析: RC=$RC OUT=$OUT"

# 15. check resolves via session; --require-tasks reports missing tasks.md.
printf '# Demo\n' > "$PROJECT/specs/NCW-4921-demo/spec.md"
printf '# Plan\n' > "$PROJECT/specs/NCW-4921-demo/plan.md"
run "$CHE_BIN" check --session s1 --json
[ "$RC" -eq 0 ] && ok || bad "check session: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" "{\"FEATURE_DIR\":\"$PROJECT/specs/NCW-4921-demo\",\"AVAILABLE_DOCS\":[]}" \
  && ok || bad "check session --json: 输出不符：$OUT"
run "$CHE_BIN" check --session s1 --json --require-tasks
[ "$RC" -eq 1 ] && ok || bad "check --require-tasks: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"ERROR: tasks.md not found"*) ok ;;
  *) bad "check --require-tasks: stderr 未报 tasks.md：$(<"$TMP/stderr")" ;;
esac

# 16. template resolves bundled references/ byte-exact; unsafe/missing names fail.
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

# 17. setup-plan copies plan-template byte-exact via session; rerun skips.
PLAN_REFS="$REPO_ROOT/skills/che-compound-plan/references"
rm -f "$PROJECT/specs/NCW-4921-demo/plan.md"
run "$CHE_BIN" setup-plan --json --references-dir "$PLAN_REFS" --session s1
[ "$RC" -eq 0 ] && ok || bad "setup-plan: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
byte_equal "$PROJECT/specs/NCW-4921-demo/plan.md" "$PLAN_REFS/plan-template.md" \
  && ok || bad "setup-plan: plan.md 与 plan-template.md 非字节一致"
json_matches "$OUT" "{\"IMPL_PLAN\":\"$PROJECT/specs/NCW-4921-demo/plan.md\"}" \
  && ok || bad "setup-plan: JSON 缺 IMPL_PLAN：$OUT"
run "$CHE_BIN" setup-plan --json --references-dir "$PLAN_REFS" --session s1
[ "$RC" -eq 0 ] && ok || bad "setup-plan 重跑: 退出码 ${RC}"
case "$(<"$TMP/stderr")" in
  *"Plan already exists"*) ok ;;
  *) bad "setup-plan 重跑: stderr 未提示已存在：$(<"$TMP/stderr")" ;;
esac
byte_equal "$PROJECT/specs/NCW-4921-demo/plan.md" "$PLAN_REFS/plan-template.md" \
  && ok || bad "setup-plan 重跑: plan.md 被改动"

# 18. setup-tasks requires plan.md; otherwise resolves tasks-template byte-exact.
TASKS_REFS="$REPO_ROOT/skills/che-compound-tasks/references"
rm "$PROJECT/specs/NCW-4921-demo/plan.md"
run "$CHE_BIN" setup-tasks --json --references-dir "$TASKS_REFS" --session s1
[ "$RC" -eq 1 ] && ok || bad "setup-tasks 无 plan: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"ERROR: plan.md not found"*) ok ;;
  *) bad "setup-tasks 无 plan: stderr 未报 plan.md：$(<"$TMP/stderr")" ;;
esac
printf '# Plan\n' > "$PROJECT/specs/NCW-4921-demo/plan.md"
run "$CHE_BIN" setup-tasks --json --references-dir "$TASKS_REFS" --session s1
[ "$RC" -eq 0 ] && ok || bad "setup-tasks: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
node -e '
  const fs = require("node:fs");
  let payload;
  try { payload = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(1); }
  process.exit(payload.TASKS_TEMPLATE_CONTENT === fs.readFileSync(process.argv[1], "utf8") ? 0 : 1);
' "$TASKS_REFS/tasks-template.md" <<<"$OUT" \
  && ok || bad "setup-tasks: TASKS_TEMPLATE_CONTENT 与 references/tasks-template.md 非字节一致"

# 19. require-intent gate: bound task without intent doc is blocked.
run "$CHE_BIN" require-intent --session s1
[ "$RC" -eq 1 ] && ok || bad "require-intent 默认拦截: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"Task directory has no intent doc (NCW-4921-demo)"*) ok ;;
  *) bad "require-intent 默认拦截: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
run "$CHE_BIN" require-intent --session s1 --json
[ "$RC" -eq 1 ] && ok || bad "require-intent --json 拦截: 退出码 ${RC}，预期 1"
json_matches "$OUT" "{\"REPO_ROOT\":\"$PROJECT\",\"GATE\":\"on\",\"TASK_DIR\":\"$PROJECT/specs/NCW-4921-demo\",\"SLUG\":\"demo\",\"INTENT_DOC\":\"$PROJECT/specs/NCW-4921-demo/intent.md\"}" \
  && ok || bad "require-intent --json: 状态不符：$OUT"

# Unbound session with gate on → resolution error (must bind or create first).
run "$CHE_BIN" require-intent --session ghost
[ "$RC" -eq 1 ] && ok || bad "require-intent 未绑定: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"session 'ghost' is not bound"*) ok ;;
  *) bad "require-intent 未绑定: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

# Matching intent doc passes.
printf '# Intent\n' > "$PROJECT/specs/NCW-4921-demo/intent.md"
run "$CHE_BIN" require-intent --session s1 --json
[ "$RC" -eq 0 ] && ok || bad "require-intent 放行: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" '{"GATE":"on","SLUG":"demo"}' \
  && ok || bad "require-intent 放行: 状态不符：$OUT"

# Toggle off via env: silent pass (json reports GATE off, no task resolution).
run env CHE_REQUIRE_INTENT=off "$CHE_BIN" require-intent --session s1
[ "$RC" -eq 0 ] && [ -z "$OUT" ] && ok || bad "require-intent env off: RC=$RC OUT=$OUT，预期静默退 0"
run env CHE_REQUIRE_INTENT=off "$CHE_BIN" require-intent --session s1 --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"GATE":"off","TASK_DIR":null,"SLUG":"","INTENT_DOC":""}' \
  && ok || bad "require-intent env off --json: RC=$RC OUT=$OUT"

# Toggle via .che/config.yml; env beats config.
printf 'require_intent: off\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" require-intent --session s1
[ "$RC" -eq 0 ] && ok || bad "require-intent config off: 退出码 ${RC}，预期 0"
run env CHE_REQUIRE_INTENT=on "$CHE_BIN" require-intent --session ghost
[ "$RC" -eq 1 ] && ok || bad "require-intent env 优先于 config: 退出码 ${RC}，预期 1"
printf 'require_intent: on\n' > "$PROJECT/.che/config.yml"
run env CHE_REQUIRE_INTENT=off "$CHE_BIN" require-intent --session s1
[ "$RC" -eq 0 ] && ok || bad "require-intent env off 优先于 config on: 退出码 ${RC}，预期 0"
printf 'require_intent: maybe\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" require-intent --session s1
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

# 20. planverify-gate: default off silent; block verdicts read task-dir report.
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 0 ] && [ -z "$OUT" ] && ok || bad "planverify-gate 默认 off: RC=$RC OUT=$OUT，预期静默退 0"
run "$CHE_BIN" planverify-gate --session s1 --json
json_matches "$OUT" "{\"REPO_ROOT\":\"$PROJECT\",\"SLUG\":\"demo\",\"MODE\":\"off\",\"REPORT\":null,\"VERDICT\":null,\"PROCEED\":true}" \
  && ok || bad "planverify-gate off --json: RC=$RC OUT=$OUT"

printf 'verdict: PASS\n' > "$PROJECT/specs/NCW-4921-demo/planverify.md"
run env SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
case "$OUT" in
  *"✓ planverify verdict for 'demo': PASS"*) ok ;;
  *) bad "planverify-gate block+PASS: RC=$RC OUT=$OUT，stderr: $(<"$TMP/stderr")" ;;
esac
printf 'verdict: REPLAN_ALLOWED\n' > "$PROJECT/specs/NCW-4921-demo/planverify.md"
run env SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 0 ] && ok || bad "planverify-gate block+REPLAN_ALLOWED: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf 'verdict: BLOCKED_DRIFT\n' > "$PROJECT/specs/NCW-4921-demo/planverify.md"
run env SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate block+BLOCKED_DRIFT: 退出码 ${RC}，预期 1"
run env SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1 --json
json_matches "$OUT" "{\"SLUG\":\"demo\",\"MODE\":\"block\",\"REPORT\":\"$PROJECT/specs/NCW-4921-demo/planverify.md\",\"VERDICT\":\"BLOCKED_DRIFT\",\"PROCEED\":false}" \
  && ok || bad "planverify-gate DRIFT --json: RC=$RC OUT=$OUT"
printf 'frontmatter without verdict\n' > "$PROJECT/specs/NCW-4921-demo/planverify.md"
run env SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 无 verdict 行: 退出码 ${RC}，预期 1"
rm "$PROJECT/specs/NCW-4921-demo/planverify.md"

# Positional slug form resolves the other task; missing report names planverify.
run env SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate payment
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 报告缺失: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"no planverify report exists for 'payment'"*) ok ;;
  *) bad "planverify-gate 报告缺失: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

# 开关经 .che/config.yml；env 优先；非法值 fail-closed。
printf 'planverify_gate: block\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate config block: 退出码 ${RC}，预期 1"
run env SKC_PLANVERIFY_GATE=off "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 0 ] && [ -z "$OUT" ] && ok || bad "planverify-gate env off 优先于 config block: RC=$RC OUT=$OUT"
printf 'planverify_gate: maybe\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate config 非法值: 退出码 ${RC}，预期 fail-closed 1"
case "$(<"$TMP/stderr")" in
  *'invalid planverify_gate mode "maybe"'*) ok ;;
  *) bad "planverify-gate config 非法值: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
run env SKC_PLANVERIFY_GATE=bogus "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate env 非法值: 退出码 ${RC}，预期 1"
rm "$PROJECT/.che/config.yml"

# 用法错误与非项目目录。
run "$CHE_BIN" planverify-gate a b
[ "$RC" -eq 2 ] && ok || bad "planverify-gate 多 slug: 退出码 ${RC}，预期 2"
OUT="$(cd "$TMP" && "$CHE_BIN" planverify-gate demo 2>"$TMP/stderr")"
RC=$?
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 非项目目录: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"not in an SDD project"*) ok ;;
  *) bad "planverify-gate 非项目目录: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
run "$CHE_BIN" planverify-gate --help
[ "$RC" -eq 0 ] && ok || bad "planverify-gate --help: 退出码 ${RC}"
run "$CHE_BIN" planverify-gate --bogus
[ "$RC" -eq 2 ] && ok || bad "planverify-gate 未知参数: 退出码 ${RC}，预期 2"

# 20b. state: runs timeline in metadata.json; stage/next derived, never stored.
run "$CHE_BIN" state start intent --session s1
[ "$RC" -eq 0 ] && ok || bad "state start: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
_before="$(md5 -q "$PROJECT/specs/NCW-4921-demo/metadata.json")"
run "$CHE_BIN" state start intent --session s1
[ "$RC" -eq 0 ] && [ "$(md5 -q "$PROJECT/specs/NCW-4921-demo/metadata.json")" = "$_before" ] \
  && ok || bad "state start 幂等: 已开启的 run 被改写"
run "$CHE_BIN" state done intent --session s1
[ "$RC" -eq 0 ] && ok || bad "state done: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
run "$CHE_BIN" state done intent --session s1
[ "$RC" -eq 1 ] && ok || bad "state done 双关: 退出码 ${RC}，预期 1"
node -e '
  const fs = require("node:fs");
  const meta = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const runs = meta.runs.intent;
  if (!Array.isArray(runs) || runs.length !== 1) process.exit(1);
  if (Number.isNaN(Date.parse(runs[0].start)) || Number.isNaN(Date.parse(runs[0].end))) process.exit(1);
  process.exit(0);
' "$PROJECT/specs/NCW-4921-demo/metadata.json" \
  && ok || bad "state done: metadata.json runs.intent 结构不符"
run "$CHE_BIN" state show --session s1 --json
[ "$RC" -eq 0 ] && ok || bad "state show --json: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" "{\"TASK_DIR\":\"$PROJECT/specs/NCW-4921-demo\",\"SLUG\":\"demo\",\"STAGE\":\"plan\",\"NEXT\":\"expectations\",\"DURATION_SECONDS\":{\"intent\":0}}" \
  && ok || bad "state show --json: 输出不符：$OUT"
run "$CHE_BIN" state show --session s1
[ "$RC" -eq 0 ] && ok || bad "state show text: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf '%s\n' "$OUT" | grep -qx "NEXT: expectations" \
  && ok || bad "state show text: 缺 NEXT 行：$OUT"
run "$CHE_BIN" state start bogus --session s1
[ "$RC" -eq 1 ] && ok || bad "state 未知阶段: 退出码 ${RC}，预期 1"
run "$CHE_BIN" state show extra --session s1
[ "$RC" -eq 2 ] && ok || bad "state show 带位置参数: 退出码 ${RC}，预期 2"
run "$CHE_BIN" state --help
[ "$RC" -eq 0 ] && ok || bad "state --help: 退出码 ${RC}"

# 21. version parity, help, unknown command.
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
