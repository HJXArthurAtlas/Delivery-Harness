#!/usr/bin/env bash
# ncw-speckit-constitution 技能运行时契约测试。
#
# 该技能的机器可执行面 = bundled scripts/resolve_template.py。
# 旧契约（.specify/ 四层模板分辨栈 overrides>presets>extensions>core、
# presets/.registry priority、全层缺失后 scaffold 到 .specify/templates/）已废弃；
# resolver 现在只读本 skill 自带 references/ 目录，不再依赖项目根或 .specify/。
# 本脚本在临时夹具里驱动它，钉住新契约：
#   1. --json 输出的 TEMPLATE_CONTENT 与 references/constitution-template.md 字节级一致（round-trip）；
#   2. 不安全模板名（如 ../etc）→ 非零退出 + stderr 报 "Could not resolve required"；
#   3. 不存在的模板名 → 非零退出 + stderr 报 "Could not resolve required"；
#   4. 夹具无需 .specify/（甚至无需 .git——resolver 不依赖 repo root），在空目录里即可运行。
#
# 范围外：SKILL.md 的占位符填充 / 版本递增 / Sync Impact Report 由 agent 执行，无确定性运行时，不测。
# 环境：python3 是技能运行时前提而非本仓测试前提；缺失则 SKIP（退出 0，不计 pass/fail）。
# 约定同 test-skill-structure.sh：set -u、ok/bad 计数、任意 CWD 可运行、零依赖（bash + python3 内联断言）。
set -u

pass=0
fail=0
ok()  { pass=$((pass + 1)); }
bad() { fail=$((fail + 1)); printf '[FAIL] %s\n' "$1"; }

if ! command -v python3 >/dev/null 2>&1; then
  printf 'speckit-constitution: SKIP（无 python3；它是技能运行时前提，不是本仓测试前提）\n'
  exit 0
fi
unset SPECIFY_INIT_DIR  # 历史环境变量，resolver 已不读，仍清掉防泄漏
export PYTHONDONTWRITEBYTECODE=1  # 禁止 python 在 skills/ 落 __pycache__（.pyc 内嵌本机路径，会撞结构校验泄漏扫描）

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESOLVER="$REPO_ROOT/skills/ncw-speckit-constitution/scripts/resolve_template.py"
TEMPLATE_REF="$REPO_ROOT/skills/ncw-speckit-constitution/references/constitution-template.md"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 空夹具：无 .specify/、无 .git——新 resolver 只认 skill 自带 references/，不依赖 repo root。
FIX="$TMP/fixture"
mkdir -p "$FIX"

run() { # run <template-name> [--json]；stdout 赋给 OUT，退出码赋给 RC，stderr 进 $TMP/stderr
  OUT="$(cd "$FIX" && python3 "$RESOLVER" "$@" 2>"$TMP/stderr")"
  RC=$?
}

# ---- 1. --json round-trip：TEMPLATE_CONTENT 与 references/ 字节级一致 ----
run constitution-template --json
[ "$RC" -eq 0 ] && ok || bad "round-trip: 退出码 $RC（期望 0），stderr: $(cat "$TMP/stderr")"
printf '%s' "$OUT" > "$TMP/out.json"
python3 - "$TMP/out.json" "$TEMPLATE_REF" <<'PY' && ok || bad "round-trip: --json 的 TEMPLATE_NAME/TEMPLATE_CONTENT 与 references/constitution-template.md 字节不一致"
import json
import sys

payload = json.loads(open(sys.argv[1], encoding="utf-8").read())
ref = open(sys.argv[2], "rb").read()
ok = (
    payload.get("TEMPLATE_NAME") == "constitution-template"
    and payload.get("TEMPLATE_CONTENT", "").encode("utf-8") == ref
)
sys.exit(0 if ok else 1)
PY

# ---- 2. 不安全模板名（路径穿越）被拒绝 -----------------------------------
run '../etc' --json
[ "$RC" -ne 0 ] && ok || bad "safename: 期望非零退出，实际 0，stdout: $OUT"
grep -q 'Could not resolve required' "$TMP/stderr" \
  && ok || bad "safename: stderr 未报模板名不可解析（实际: $(cat "$TMP/stderr")）"

# ---- 3. 不存在的模板名 ----------------------------------------------------
run no-such-template --json
[ "$RC" -ne 0 ] && ok || bad "missing: 期望非零退出，实际 0，stdout: $OUT"
grep -q 'Could not resolve required' "$TMP/stderr" \
  && ok || bad "missing: stderr 未报缺模板（实际: $(cat "$TMP/stderr")）"

printf 'speckit-constitution: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
