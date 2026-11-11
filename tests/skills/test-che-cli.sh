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
unset CHE_INIT_DIR CHE_FEATURE CHE_FEATURE_DIRECTORY CHE_SESSION_ID SKC_PLANVERIFY_GATE SKC_ADR_GATE
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

# 1. No tasks yet → resolution error naming intend / task create.
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
json_matches "$OUT" "{\"REPO_ROOT\":\"$PROJECT\",\"BRANCH\":\"001-demo\",\"SLUG\":\"demo\",\"FEATURE_DIR\":\"$PROJECT/specs/001-demo\",\"FEATURE_SPEC\":\"$PROJECT/specs/001-demo/intent.md\",\"IMPL_PLAN\":\"$PROJECT/specs/001-demo/plan.md\",\"TASKS\":\"$PROJECT/specs/001-demo/tasks.md\"}" \
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
run2 "$CHE_BIN" task create solo --summary "让后台支持用户名登录"
[ "$RC" -eq 0 ] && ok || bad "project2 task create: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
[ -d "$PROJECT2/specs/001-solo" ] && ok || bad "project2 task create: 目录未创建"
grep -q '"summary":"让后台支持用户名登录"' "$PROJECT2/specs/001-solo/metadata.json" \
  && ok || bad "project2 task create: summary 未写入 metadata.json"
run2 "$CHE_BIN" task list
[ "$RC" -eq 0 ] && ok || bad "task list text: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf '%s\n' "$OUT" | grep -q "^solo  \[created\]  让后台支持用户名登录$" \
  && ok || bad "task list text: 缺 summary/stage 行：$OUT"
run2 "$CHE_BIN" task list --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"tasks":[{"SLUG":"solo","STAGE":"created","SUMMARY":"让后台支持用户名登录"}]}' \
  && ok || bad "task list --json: 输出不符：$OUT"
run2 "$CHE_BIN" paths --json
[ "$RC" -eq 0 ] && json_matches "$OUT" '{"SLUG":"solo"}' \
  && ok || bad "project2 单任务自动解析: RC=$RC OUT=$OUT"

# 15. check resolves via session; --require-tasks reports missing tasks.md.
printf '# Demo\n' > "$PROJECT/specs/NCW-4921-demo/intent.md"
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
CONSTITUTION_REFS="$REPO_ROOT/skills/che-constitution/references"
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
PLAN_REFS="$REPO_ROOT/skills/che-plan/references"
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
TASKS_REFS="$REPO_ROOT/skills/che-plan/references"
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

# 19. require-intent removed: follows the normal unknown-command path (exit 2).
run "$CHE_BIN" require-intent --session s1
[ "$RC" -eq 2 ] && ok || bad "require-intent 已移除: 退出码 ${RC}，预期 2"
case "$(<"$TMP/stderr")" in
  *"ERROR: Unknown command 'require-intent'"*) ok ;;
  *) bad "require-intent 已移除: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

# 20. planverify-gate: 双 gate —— adr_gate（默认 block）+ planverify_gate（默认 off）。
DEMO_DIR="$PROJECT/specs/NCW-4921-demo"
PV_REPORT="$DEMO_DIR/evidence/planverify.md"
mkdir -p "$DEMO_DIR/evidence"
# 写一份带 ADR 字段与三工件 hash 的完整报告：<verdict> <adr_status>
write_full_report() {
  {
    printf 'verdict: %s\n' "$1"
    printf 'adr_status: %s\n' "$2"
    printf 'adr_governed: 0\n'
    printf 'adr_departures: 0\n'
    printf 'adr_corpus_errors: 0\n'
    printf 'adr_evaluator: not_configured\n'
    printf 'intent_sha256: %s\n' "$(shasum -a 256 "$DEMO_DIR/intent.md" | awk '{print $1}')"
    printf 'plan_sha256: %s\n' "$(shasum -a 256 "$DEMO_DIR/plan.md" | awk '{print $1}')"
    printf 'tasks_sha256: %s\n' "$(shasum -a 256 "$DEMO_DIR/tasks.md" | awk '{print $1}')"
  } > "$PV_REPORT"
}

# 默认配置：adr_gate=block 缺报告 → 拒绝；JSON 报告 ADR_GATE=block。
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 默认 adr block 无报告: RC=$RC，预期 1"
case "$(<"$TMP/stderr")" in
  *"no planverify report exists for 'demo'"*) ok ;;
  *) bad "planverify-gate 默认 adr block: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
run "$CHE_BIN" planverify-gate --session s1 --json
json_matches "$OUT" "{\"REPO_ROOT\":\"$PROJECT\",\"SLUG\":\"demo\",\"MODE\":\"off\",\"ADR_GATE\":\"block\",\"REPORT\":null,\"VERDICT\":null,\"PROCEED\":false}" \
  && ok || bad "planverify-gate 默认 --json: RC=$RC OUT=$OUT"

# 旧报告缺 adr_status → 默认配置要求重跑，不按 clean 放行。
printf 'verdict: PASS\n' > "$PV_REPORT"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 旧报告缺 adr_status: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"predates the ADR layer"*) ok ;;
  *) bad "planverify-gate 旧报告缺 adr_status: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

# 双 gate 均 off → 不阻断（静默退 0）。
run env SKC_ADR_GATE=off "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 0 ] && [ -z "$OUT" ] && ok || bad "planverify-gate 双 off: RC=$RC OUT=[$OUT] 预期静默退 0"
run env SKC_ADR_GATE=off "$CHE_BIN" planverify-gate --session s1 --json
json_matches "$OUT" "{\"SLUG\":\"demo\",\"MODE\":\"off\",\"ADR_GATE\":\"off\",\"PROCEED\":true}" \
  && ok || bad "planverify-gate 双 off --json: RC=$RC OUT=$OUT"

# 旧版平铺报告兼容：evidence/ 缺失时退读任务目录根的 planverify.md（REPORT 指向旧路径）。
rm -f "$PV_REPORT"
printf 'verdict: PASS\n' > "$DEMO_DIR/planverify.md"
run "$CHE_BIN" planverify-gate --session s1 --json
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 平铺旧报告缺 adr_status: RC=$RC，预期 1"
case "$OUT" in
  *"\"REPORT\":\"$DEMO_DIR/planverify.md\""*) ok ;;
  *) bad "planverify-gate 平铺旧报告: --json REPORT 未指向旧路径: OUT=$OUT" ;;
esac
case "$(<"$TMP/stderr")" in
  *"predates the ADR layer"*) ok ;;
  *) bad "planverify-gate 平铺旧报告: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
# 两处并存 → evidence/ 优先。
printf 'verdict: PASS\n' > "$PV_REPORT"
run "$CHE_BIN" planverify-gate --session s1 --json
case "$OUT" in
  *"\"REPORT\":\"$PV_REPORT\""*) ok ;;
  *) bad "planverify-gate 双路径并存: --json REPORT 未指向 evidence/: OUT=$OUT" ;;
esac
rm -f "$DEMO_DIR/planverify.md"

# adr_gate=off + planverify_gate=block：仅语义 verdict，不查 ADR 字段/hash。
printf 'verdict: PASS\n' > "$PV_REPORT"
run env SKC_ADR_GATE=off SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
case "$OUT" in
  *"✓ planverify verdict for 'demo': PASS"*) ok ;;
  *) bad "planverify-gate block+PASS: RC=$RC OUT=[$OUT] stderr: $(<"$TMP/stderr")" ;;
esac
printf 'verdict: REPLAN_ALLOWED\n' > "$PV_REPORT"
run env SKC_ADR_GATE=off SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 0 ] && ok || bad "planverify-gate block+REPLAN_ALLOWED: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf 'verdict: BLOCKED_DRIFT\n' > "$PV_REPORT"
run env SKC_ADR_GATE=off SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate block+BLOCKED_DRIFT: 退出码 ${RC}，预期 1"
run env SKC_ADR_GATE=off SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1 --json
json_matches "$OUT" "{\"SLUG\":\"demo\",\"MODE\":\"block\",\"ADR_GATE\":\"off\",\"REPORT\":\"$PV_REPORT\",\"VERDICT\":\"BLOCKED_DRIFT\",\"PROCEED\":false}" \
  && ok || bad "planverify-gate DRIFT --json: RC=$RC OUT=$OUT"
# 未知 verdict → fail-closed。
printf 'verdict: GARBAGE\n' > "$PV_REPORT"
run env SKC_ADR_GATE=off SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 未知 verdict: 退出码 ${RC}，预期 fail-closed 1"
case "$(<"$TMP/stderr")" in
  *"Unrecognized planverify verdict"*) ok ;;
  *) bad "planverify-gate 未知 verdict: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
printf 'frontmatter without verdict\n' > "$PV_REPORT"
run env SKC_ADR_GATE=off SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 无 verdict 行: 退出码 ${RC}，预期 1"

# 完整报告 + 默认双 gate：PASS + adr clean + hash 匹配 → 放行。
printf '# Tasks\n' > "$DEMO_DIR/tasks.md"
write_full_report PASS clean
run "$CHE_BIN" planverify-gate --session s1
case "$OUT" in
  *"✓ planverify verdict for 'demo': PASS"*) ok ;;
  *) bad "planverify-gate 完整报告 PASS: RC=$RC OUT=[$OUT] stderr: $(<"$TMP/stderr")" ;;
esac
run "$CHE_BIN" planverify-gate --session s1 --json
json_matches "$OUT" "{\"SLUG\":\"demo\",\"MODE\":\"off\",\"ADR_GATE\":\"block\",\"VERDICT\":\"PASS\",\"ADR_STATUS\":\"clean\",\"HASHES_MATCH\":true,\"PROCEED\":true}" \
  && ok || bad "planverify-gate 完整报告 --json: RC=$RC OUT=$OUT"

# BLOCKED_ADR：adr_status=blocked（adr_gate 默认 block 拒绝）；verdict=BLOCKED_ADR
# + adr clean（planverify_gate=block 拒绝）。
write_full_report BLOCKED_ADR blocked
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate adr_status blocked: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"adr_status is 'blocked'"*) ok ;;
  *) bad "planverify-gate adr_status blocked: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
write_full_report BLOCKED_ADR clean
run env SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate pv block+BLOCKED_ADR: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"verdict is BLOCKED_ADR"*) ok ;;
  *) bad "planverify-gate pv block+BLOCKED_ADR: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
# 未知 verdict 在默认 adr_gate block 路径同样 fail-closed。
write_full_report GARBAGE clean
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 默认路径未知 verdict: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"Unrecognized planverify verdict"*) ok ;;
  *) bad "planverify-gate 默认路径未知 verdict: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

# hash 不匹配（修 plan 后未重跑 planverify）→ 拒绝；JSON 报 HASHES_MATCH=false。
write_full_report PASS clean
printf '# Plan v2\n' > "$DEMO_DIR/plan.md"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate hash 不匹配: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"no longer matches the current"*) ok ;;
  *) bad "planverify-gate hash 不匹配: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
run "$CHE_BIN" planverify-gate --session s1 --json
json_matches "$OUT" "{\"VERDICT\":\"PASS\",\"ADR_STATUS\":\"clean\",\"HASHES_MATCH\":false,\"PROCEED\":false}" \
  && ok || bad "planverify-gate hash 不匹配 --json: RC=$RC OUT=$OUT"
# 报告缺 hash 字段同样视为过期。
{
  printf 'verdict: PASS\n'
  printf 'adr_status: clean\n'
} > "$PV_REPORT"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 缺 hash 字段: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"no longer matches the current"*) ok ;;
  *) bad "planverify-gate 缺 hash 字段: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
printf '# Plan\n' > "$DEMO_DIR/plan.md"
rm "$PV_REPORT" "$DEMO_DIR/tasks.md"

# Positional slug form resolves the other task; missing report names planverify.
run env SKC_ADR_GATE=off SKC_PLANVERIFY_GATE=block "$CHE_BIN" planverify-gate payment
[ "$RC" -eq 1 ] && ok || bad "planverify-gate 报告缺失: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"no planverify report exists for 'payment'"*) ok ;;
  *) bad "planverify-gate 报告缺失: 错误信息不符：$(<"$TMP/stderr")" ;;
esac

# 开关经 .che/config.yml；env 优先；非法值 fail-closed。
printf 'adr_gate: off\nplanverify_gate: off\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 0 ] && [ -z "$OUT" ] && ok || bad "planverify-gate config 双 off: RC=$RC OUT=[$OUT] 预期静默退 0"
printf 'adr_gate: block\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate config adr block: 退出码 ${RC}，预期 1"
run env SKC_ADR_GATE=off "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 0 ] && [ -z "$OUT" ] && ok || bad "planverify-gate env adr off 优先于 config block: RC=$RC OUT=$OUT"
printf 'adr_gate: maybe\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate config adr 非法值: 退出码 ${RC}，预期 fail-closed 1"
case "$(<"$TMP/stderr")" in
  *'invalid adr_gate mode "maybe"'*) ok ;;
  *) bad "planverify-gate config adr 非法值: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
printf 'adr_gate: off\nplanverify_gate: maybe\n' > "$PROJECT/.che/config.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate config 非法值: 退出码 ${RC}，预期 fail-closed 1"
case "$(<"$TMP/stderr")" in
  *'invalid planverify_gate mode "maybe"'*) ok ;;
  *) bad "planverify-gate config 非法值: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
run env SKC_ADR_GATE=off SKC_PLANVERIFY_GATE=bogus "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate env 非法值: 退出码 ${RC}，预期 1"
rm "$PROJECT/.che/config.yml"

# 开关机器本地覆盖层：.che/config.local.yml 逐键覆盖 .che/config.yml；
# 覆盖层缺键或空值回落团队基座；env 优先于两层；非法值 fail-closed 并标注来源文件。
printf 'adr_gate: off\nplanverify_gate: off\n' > "$PROJECT/.che/config.yml"
printf '# 机器本地覆盖层（/che-project-init 生成，不入库）\nadr_gate: block\n' > "$PROJECT/.che/config.local.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate local 覆盖 block: 退出码 ${RC}，预期 1"
printf 'adr_gate:\n' > "$PROJECT/.che/config.local.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 0 ] && [ -z "$OUT" ] && ok || bad "planverify-gate local 空值回落基座: RC=$RC OUT=[$OUT] 预期静默退 0"
run env SKC_ADR_GATE=block "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate env 优先于 local off: 退出码 ${RC}，预期 1"
printf 'adr_gate: maybe\n' > "$PROJECT/.che/config.local.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate local 非法值: 退出码 ${RC}，预期 fail-closed 1"
case "$(<"$TMP/stderr")" in
  *'invalid adr_gate mode "maybe" from .che/config.local.yml'*) ok ;;
  *) bad "planverify-gate local 非法值: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
printf 'planverify_gate: block\n' > "$PROJECT/.che/config.local.yml"
run "$CHE_BIN" planverify-gate --session s1
[ "$RC" -eq 1 ] && ok || bad "planverify-gate local pv block 无报告: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"no planverify report exists for 'demo'"*) ok ;;
  *) bad "planverify-gate local pv block: 错误信息不符：$(<"$TMP/stderr")" ;;
esac
rm "$PROJECT/.che/config.local.yml"

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
run "$CHE_BIN" state start intend --session s1
[ "$RC" -eq 0 ] && ok || bad "state start intend: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
_before="$(md5 -q "$PROJECT/specs/NCW-4921-demo/metadata.json")"
run "$CHE_BIN" state start intend --session s1
[ "$RC" -eq 0 ] && [ "$(md5 -q "$PROJECT/specs/NCW-4921-demo/metadata.json")" = "$_before" ] \
  && ok || bad "state start 幂等: 已开启的 run 被改写"
run "$CHE_BIN" state done intend --session s1
[ "$RC" -eq 0 ] && ok || bad "state done intend: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
run "$CHE_BIN" state done intend --session s1
[ "$RC" -eq 1 ] && ok || bad "state done 双关: 退出码 ${RC}，预期 1"
node -e '
  const fs = require("node:fs");
  const meta = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const runs = meta.runs.intend;
  if (!Array.isArray(runs) || runs.length !== 1) process.exit(1);
  if (Number.isNaN(Date.parse(runs[0].start)) || Number.isNaN(Date.parse(runs[0].end))) process.exit(1);
  process.exit(0);
' "$PROJECT/specs/NCW-4921-demo/metadata.json" \
  && ok || bad "state done: metadata.json runs.intend 结构不符"
run "$CHE_BIN" state show --session s1 --json
[ "$RC" -eq 0 ] && ok || bad "state show --json: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
json_matches "$OUT" "{\"TASK_DIR\":\"$PROJECT/specs/NCW-4921-demo\",\"SLUG\":\"demo\",\"STAGE\":\"plan\",\"NEXT\":\"clarify\",\"DURATION_SECONDS\":{\"intend\":0}}" \
  && ok || bad "state show --json: 输出不符：$OUT"
run "$CHE_BIN" state show --session s1
[ "$RC" -eq 0 ] && ok || bad "state show text: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
printf '%s\n' "$OUT" | grep -qx "NEXT: clarify" \
  && ok || bad "state show text: intend 关闭后 NEXT 应为 clarify：$OUT"
run "$CHE_BIN" state start expectations --session s1
[ "$RC" -eq 1 ] && ok || bad "state start expectations（已退役）: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *retired*) ok ;;
  *) bad "state start expectations: 错误信息应标明 retired：$(<"$TMP/stderr")" ;;
esac
# legacy open expectations run：仍可读取、不参与 NEXT 计算、可关闭。
node -e '
  const fs = require("node:fs");
  const p = process.argv[1];
  const meta = JSON.parse(fs.readFileSync(p, "utf8"));
  meta.runs.expectations = [{ start: "2020-01-01T00:00:00.000Z", end: null }];
  fs.writeFileSync(p, JSON.stringify(meta) + "\n");
' "$PROJECT/specs/NCW-4921-demo/metadata.json"
run "$CHE_BIN" state show --session s1 --json
json_matches "$OUT" '{"NEXT":"clarify","RUNS":{"expectations":[{"start":"2020-01-01T00:00:00.000Z","end":null}]}}' \
  && ok || bad "state show（legacy open run）: expectations 应可见且不参与 NEXT：$OUT"
run "$CHE_BIN" state done expectations --session s1
[ "$RC" -eq 0 ] && ok || bad "state done expectations（legacy 开放 run）: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
node -e '
  const fs = require("node:fs");
  const meta = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const run = meta.runs.expectations[0];
  if (run.end === null || Number.isNaN(Date.parse(run.end))) process.exit(1);
  process.exit(0);
' "$PROJECT/specs/NCW-4921-demo/metadata.json" \
  && ok || bad "state done expectations: legacy run 未被关闭"
run "$CHE_BIN" state done expectations --session s1
[ "$RC" -eq 1 ] && ok || bad "state done expectations（已闭环）: 退出码 ${RC}，预期 1"
run "$CHE_BIN" state start specify --session s1
[ "$RC" -eq 1 ] && ok || bad "state start specify: 退出码 ${RC}，预期 1（specify 阶段已更名 intend）"
run "$CHE_BIN" state start bogus --session s1
[ "$RC" -eq 1 ] && ok || bad "state 未知阶段: 退出码 ${RC}，预期 1"
run "$CHE_BIN" state show extra --session s1
[ "$RC" -eq 2 ] && ok || bad "state show 带位置参数: 退出码 ${RC}，预期 2"
run "$CHE_BIN" state --help
[ "$RC" -eq 0 ] && ok || bad "state --help: 退出码 ${RC}"

# 20b. pack lifecycle against a local fixture repo (git + file:// transport).
# Fixture timeline: tag v0.5.0 (skills alpha,beta; engines.che >=0.3.0) then an
# untagged main bump to 0.6.0 (adds skill delta; engines.che >=99.0.0) so
# CHANNEL_DRIFT and the minCli guard are both reachable.
if ! command -v git >/dev/null 2>&1; then
  printf '[SKIP] pack 契约: 本机无 git，无法构建 fixture 仓\n'
else
unset CHE_PACK_REPO
FIXTURE="$TMP/packrepo"
PACKPROJ="$TMP/packproj"
mkdir -p "$PACKPROJ/.git"
runp() { # runp <command...>; same as run() but in PACKPROJ
  OUT="$(cd "$PACKPROJ" && "$@" 2>"$TMP/stderr")"
  RC=$?
}
git init -q -b main "$FIXTURE"
mkdir -p "$FIXTURE/skills/alpha" "$FIXTURE/skills/beta"
printf 'name: alpha\n' > "$FIXTURE/skills/alpha/SKILL.md"
printf 'name: beta\n' > "$FIXTURE/skills/beta/SKILL.md"
printf '{"name":"ncw-delivery-harness","version":"0.5.0","engines":{"che":">=0.3.0"}}' > "$FIXTURE/package.json"
git -C "$FIXTURE" add -A
git -C "$FIXTURE" -c user.email=test@local -c user.name=test commit -qm 'v0.5.0 fixture'
git -C "$FIXTURE" tag v0.5.0
git -C "$FIXTURE" config uploadpack.allowReachableSHA1InWant true

# init: installs skills, writes the manifest, prints the project-init hint.
runp "$CHE_BIN" pack init --from "file://$FIXTURE"
[ "$RC" -eq 0 ] && ok || bad "pack init: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
[ -f "$PACKPROJ/.agents/skills/alpha/SKILL.md" ] && ok || bad "pack init: alpha 未安装"
node -e '
  const m = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"));
  const ok = m.schema === 1 && m.pack === "ncw-delivery-harness" && m.packVersion === "0.5.0" &&
    m.ref === "v0.5.0" && m.target === ".agents/skills" && m.minCliVersion === ">=0.3.0" &&
    JSON.stringify(m.skills) === JSON.stringify(["alpha", "beta"]) && !Number.isNaN(Date.parse(m.updatedAt));
  process.exit(ok ? 0 : 1);
' "$PACKPROJ/.che/pack.json" && ok || bad "pack init: manifest 字段不符：$(cat "$PACKPROJ/.che/pack.json")"
case "$OUT" in
  *"正在安装 NCW Delivery Harness 0.5.0 ..."*"安装完成 0.5.0."*"安装2个 (2个新增"*"下一步:"*"执行 /che-project-init"*) ok ;;
  *) bad "pack init: 输出格式不符：$OUT" ;;
esac

# init again without --force → points at update; --force reinstalls in place.
runp "$CHE_BIN" pack init --from "file://$FIXTURE"
[ "$RC" -eq 1 ] && ok || bad "pack init 二次: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"che pack update"*) ok ;;
  *) bad "pack init 二次: stderr 未指向 che pack update：$(<"$TMP/stderr")" ;;
esac
runp "$CHE_BIN" pack init --from "file://$FIXTURE" --force --json
json_matches "$OUT" '{"INSTALLED":{"packVersion":"0.5.0","ref":"v0.5.0"},"ACTION":"reinstall"}' \
  && ok || bad "pack init --force --json: $OUT"

# unmanaged same-name dirs block a fresh init until --force (同名不覆盖).
FRESH="$TMP/packfresh"
mkdir -p "$FRESH/.git" "$FRESH/.agents/skills/alpha"
printf 'local edit\n' > "$FRESH/.agents/skills/alpha/SKILL.md"
OUT="$(cd "$FRESH" && "$CHE_BIN" pack init --from "file://$FIXTURE" 2>"$TMP/stderr")"; RC=$?
[ "$RC" -eq 1 ] && ok || bad "pack init 冲突: 退出码 ${RC}，预期 1"
case "$(<"$TMP/stderr")" in
  *"unmanaged"*"alpha"*) ok ;;
  *) bad "pack init 冲突: stderr 未列出 alpha：$(<"$TMP/stderr")" ;;
esac
OUT="$(cd "$FRESH" && "$CHE_BIN" pack init --from "file://$FIXTURE" --force 2>"$TMP/stderr")"; RC=$?
[ "$RC" -eq 0 ] && ok || bad "pack init --force: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
byte_equal "$FRESH/.agents/skills/alpha/SKILL.md" "$FIXTURE/skills/alpha/SKILL.md" \
  && ok || bad "pack init --force: 未以上游内容覆盖本地 alpha"

# update is idempotent on the same commit (updatedAt must not churn).
runp "$CHE_BIN" pack update
[ "$RC" -eq 0 ] && ok || bad "pack update 幂等前: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
runp "$CHE_BIN" pack update
[ "$RC" -eq 0 ] && ok || bad "pack update 幂等: 退出码 ${RC}"
 case "$OUT" in
  *"NCW Delivery Harness 当前版本： 0.5.0"*"✓ 已是最新版本"*) ok ;;
  *) bad "pack update 幂等: 横幅不符：$OUT" ;;
 esac
UPDATED_AT_1="$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).updatedAt' "$PACKPROJ/.che/pack.json")"
runp "$CHE_BIN" pack update --dry-run
[ "$RC" -eq 0 ] && ok || bad "pack update --dry-run: 退出码 ${RC}"
UPDATED_AT_2="$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).updatedAt' "$PACKPROJ/.che/pack.json")"
[ "$UPDATED_AT_1" = "$UPDATED_AT_2" ] && ok || bad "pack update 幂等: updatedAt 被 churn（$UPDATED_AT_1 → $UPDATED_AT_2）"

# Hand-broken managed skill: plain update keeps local edits (same commit),
# --force is the repair path that reinstalls from upstream.
printf 'broken by hand\n' > "$PACKPROJ/.agents/skills/alpha/SKILL.md"
runp "$CHE_BIN" pack update
 case "$OUT" in
  *"NCW Delivery Harness 当前版本： 0.5.0"*"✓ 已是最新版本"*) ok ;;
  *) bad "pack update 改坏场景: 横幅不符：$OUT" ;;
 esac
[ "$(cat "$PACKPROJ/.agents/skills/alpha/SKILL.md")" = "broken by hand" ] \
  && ok || bad "pack update 改坏场景: 同 commit 下不应改写本地文件"
runp "$CHE_BIN" pack update --force
[ "$RC" -eq 0 ] && ok || bad "pack update --force 修复: 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
byte_equal "$PACKPROJ/.agents/skills/alpha/SKILL.md" "$FIXTURE/skills/alpha/SKILL.md" \
  && ok || bad "pack update --force 修复: 未恢复为上游内容"

# untagged main bump: drift detection + dry-run plan against main + minCli guard.
mkdir -p "$FIXTURE/skills/delta"
printf 'name: delta\n' > "$FIXTURE/skills/delta/SKILL.md"
printf '{"name":"ncw-delivery-harness","version":"0.6.0","engines":{"che":">=99.0.0"}}' > "$FIXTURE/package.json"
git -C "$FIXTURE" add -A
git -C "$FIXTURE" -c user.email=test@local -c user.name=test commit -qm 'v0.6.0 untagged fixture'
MAIN_SHA="$(git -C "$FIXTURE" rev-parse main)"

runp "$CHE_BIN" pack status
[ "$RC" -eq 1 ] && ok || bad "pack status 漂移: 退出码 ${RC}，预期 1"
case "$OUT" in
  *"CHANNEL_DRIFT"*"0.6.0"*) ok ;;
  *) bad "pack status 漂移: 未报 CHANNEL_DRIFT：$OUT" ;;
esac

runp "$CHE_BIN" pack update --ref main --dry-run
[ "$RC" -eq 0 ] && ok || bad "pack update --dry-run(main): 退出码 ${RC}"
case "$OUT" in
  *"DRY-RUN: no changes written"*) ok ;;
  *) bad "pack update --dry-run(main): 未声明不落盘：$OUT" ;;
esac
[ ! -d "$PACKPROJ/.agents/skills/delta" ] && ok || bad "pack update --dry-run(main): 落盘了 delta"

 runp "$CHE_BIN" pack update --ref main
case "$OUT" in
  *"NCW Delivery Harness 当前版本： 0.5.0"*"发现新版本： main"*"正在安装新版本……"*"✓ 成功更新到 0.6.0"*"开启新对话 或 在当前对话Reload Skills以使用新版本"*) ok ;;
  *) bad "pack update(main): 横幅不符：$OUT" ;;
esac
[ "$RC" -eq 0 ] && ok || bad "pack update(main): 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
case "$(<"$TMP/stderr")" in
  *"requires che >=99.0.0"*) ok ;;
  *) bad "pack update(main): stderr 未警告 minCli：$(<"$TMP/stderr")" ;;
esac
[ -f "$PACKPROJ/.agents/skills/delta/SKILL.md" ] && ok || bad "pack update(main): delta 未安装"

runp "$CHE_BIN" pack status --json
json_matches "$OUT" '{"INSTALLED":{"packVersion":"0.6.0","ref":"main"},"UPDATE_AVAILABLE":false,"SKILLS":{"managed":3,"missing":[],"extra":[]},"CLI":{"minRequired":">=99.0.0","ok":false}}' \
  && ok || bad "pack status --json(minCli): $OUT"
[ "$RC" -eq 1 ] && ok || bad "pack status minCli 不达标: 退出码 ${RC}，预期 1"

# update by raw commit SHA (fetch-by-SHA path; releases should pin tags).
runp "$CHE_BIN" pack update --ref "$MAIN_SHA"
[ "$RC" -eq 0 ] && ok || bad "pack update(sha): 退出码 ${RC}，stderr: $(<"$TMP/stderr")"
node -e '
  const m = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"));
  process.exit(m.ref === process.argv[2] ? 0 : 1);
' "$PACKPROJ/.che/pack.json" "$MAIN_SHA" && ok || bad "pack update(sha): manifest.ref 未记录 sha"

# no manifest → environment error; bogus ref → network/usage error (exit 2).
rm "$PACKPROJ/.che/pack.json"
runp "$CHE_BIN" pack status
[ "$RC" -eq 2 ] && ok || bad "pack status 无 manifest: 退出码 ${RC}，预期 2"
case "$(<"$TMP/stderr")" in
  *"che pack init"*) ok ;;
  *) bad "pack status 无 manifest: stderr 未指向 che pack init：$(<"$TMP/stderr")" ;;
esac
runp "$CHE_BIN" pack update --ref no-such-tag
[ "$RC" -eq 2 ] && ok || bad "pack update 未知 ref: 退出码 ${RC}，预期 2"
runp "$CHE_BIN" pack bogus
[ "$RC" -eq 2 ] && ok || bad "pack 未知子命令: 退出码 ${RC}，预期 2"
fi

# 20c. self-update guards (dev checkout refusal is deterministic in this tree).
run "$CHE_BIN" self-update --help
[ "$RC" -eq 0 ] && ok || bad "self-update --help: 退出码 ${RC}"
run "$CHE_BIN" self-update
[ "$RC" -eq 2 ] && ok || bad "self-update 开发链: 退出码 ${RC}，预期 2"
case "$(<"$TMP/stderr")" in
  *"development checkout"*) ok ;;
  *) bad "self-update 开发链: stderr 未说明开发链拒绝：$(<"$TMP/stderr")" ;;
esac
run "$CHE_BIN" self-update --no-such-flag
[ "$RC" -eq 2 ] && ok || bad "self-update 未知 flag: 退出码 ${RC}，预期 2"

# 20d. knowledge paths: default, declarations, conflict, --root, containment.
KNOWPROJ="$TMP/knowproj"
mkdir -p "$KNOWPROJ/.git"
runk() { # runk <command...>; same as run() but in KNOWPROJ
  OUT="$(cd "$KNOWPROJ" && "$@" 2>"$TMP/stderr")"
  RC=$?
}
runk "$CHE_BIN" knowledge paths --json
[ "$RC" -eq 0 ] && ok || bad "knowledge default: 退出码 ${RC}"
[ "$(node -p 'JSON.parse(process.argv[1]).KNOWLEDGE_ROOT' "$OUT")" = "$KNOWPROJ/docs/domain_knowledge" ] \
  && ok || bad "knowledge default: KNOWLEDGE_ROOT=$(node -p 'JSON.parse(process.argv[1]).KNOWLEDGE_ROOT' "$OUT")"
[ "$(node -p 'JSON.parse(process.argv[1]).CONTEXT_FILE' "$OUT")" = "$KNOWPROJ/docs/domain_knowledge/CONTEXT.md" ] \
  && ok || bad "knowledge default: CONTEXT_FILE 不符"
[ "$(node -p 'JSON.parse(process.argv[1]).SOURCE.PRIORITY' "$OUT")" = "4" ] \
  && ok || bad "knowledge default: SOURCE.PRIORITY 非 4"
[ "$(node -p 'JSON.parse(process.argv[1]).GLOSSARY_EXISTS' "$OUT")" = "false" ] \
  && ok || bad "knowledge default: GLOSSARY_EXISTS 非 false"

printf 'knowledge_root: knowledge\n' > "$KNOWPROJ/AGENTS.md"
runk "$CHE_BIN" knowledge paths --json
[ "$(node -p 'JSON.parse(process.argv[1]).KNOWLEDGE_ROOT' "$OUT")" = "$KNOWPROJ/knowledge" ] \
  && ok || bad "knowledge AGENTS 覆盖: KNOWLEDGE_ROOT 不符"
[ "$(node -p 'JSON.parse(process.argv[1]).SOURCE.PRIORITY' "$OUT")" = "2" ] \
  && ok || bad "knowledge AGENTS 覆盖: SOURCE.PRIORITY 非 2"

printf 'knowledge_root: other\n' > "$KNOWPROJ/CLAUDE.md"
runk "$CHE_BIN" knowledge paths --json
[ "$RC" -eq 2 ] && ok || bad "knowledge 同级冲突: 退出码 ${RC}，预期 2"
case "$(<"$TMP/stderr")" in
  *"conflicting"*) ok ;;
  *) bad "knowledge 同级冲突: stderr 未报冲突：$(<"$TMP/stderr")" ;;
esac
printf 'knowledge_root: knowledge\n' > "$KNOWPROJ/CLAUDE.md"
runk "$CHE_BIN" knowledge paths --json
[ "$RC" -eq 0 ] && ok || bad "knowledge 同级一致: 退出码 ${RC}"

runk "$CHE_BIN" knowledge paths --root docs/knowledge/CONTEXT.md --json
[ "$(node -p 'JSON.parse(process.argv[1]).CONTEXT_FILE' "$OUT")" = "$KNOWPROJ/docs/knowledge/CONTEXT.md" ] \
  && ok || bad "knowledge --root 文件: CONTEXT_FILE 不符"
[ "$(node -p 'JSON.parse(process.argv[1]).KNOWLEDGE_ROOT' "$OUT")" = "$KNOWPROJ/docs/knowledge" ] \
  && ok || bad "knowledge --root 文件: KNOWLEDGE_ROOT 非父目录"
[ "$(node -p 'JSON.parse(process.argv[1]).SOURCE.PRIORITY' "$OUT")" = "1" ] \
  && ok || bad "knowledge --root: SOURCE.PRIORITY 非 1"

runk "$CHE_BIN" knowledge paths --root ../outside --json
[ "$RC" -eq 3 ] && ok || bad "knowledge 越界: 退出码 ${RC}，预期 3"

mkdir -p "$KNOWPROJ/docs"
printf '# legacy\n' > "$KNOWPROJ/docs/GLOSSARY.md"
runk "$CHE_BIN" knowledge paths --json
[ "$(node -p 'JSON.parse(process.argv[1]).GLOSSARY_EXISTS' "$OUT")" = "true" ] \
  && ok || bad "knowledge legacy: GLOSSARY_EXISTS 非 true"

runk "$CHE_BIN" knowledge bogus
[ "$RC" -eq 2 ] && ok || bad "knowledge 未知子命令: 退出码 ${RC}，预期 2"
runk "$CHE_BIN" knowledge paths
[ "$RC" -eq 0 ] && ok || bad "knowledge 人类输出: 退出码 ${RC}"

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
