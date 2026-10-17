#!/usr/bin/env bash
# ncw-speckit-constitution 技能运行时契约测试。
#
# 该技能的机器可执行面 = bundled scripts/resolve_template.py（spec-kit v1.1.3 逐字副本），
# 本脚本在临时夹具项目里驱动它，钉住 SKILL.md 依赖的模板分辨栈契约：
#   1. 核心层 .specify/templates/ 可解析（--json 形状 + 非 ASCII 内容透传）；
#   2. 层优先级 overrides/ > presets/ > extensions/ > 核心层；
#   3. presets/.registry 的 priority 决定多 preset 之间的取舍；
#   4. 全层缺失 → 非零退出 + stderr 报 "Could not resolve required"（SKILL.md 的 scaffold 触发条件）；
#   5. references/constitution-template.md 落进核心层后字节级 round-trip；
#   6. 非安全模板名（如 Bad_Name）被拒绝，不做路径穿越。
#
# 范围外：SKILL.md 的占位符填充 / 版本递增 / Sync Impact Report 由 agent 执行，无确定性运行时，不测。
# 环境：python3 是技能运行时前提而非本仓测试前提；缺失则 SKIP（退出 0，不计 pass/fail）。
# 约定同 test-skill-structure.sh：set -u、ok/bad 计数、任意 CWD 可运行、零依赖（bash + node ≥22 内联断言）。
set -u

pass=0
fail=0
ok()  { pass=$((pass + 1)); }
bad() { fail=$((fail + 1)); printf '[FAIL] %s\n' "$1"; }

if ! command -v python3 >/dev/null 2>&1; then
  printf 'speckit-constitution: SKIP（无 python3；它是技能运行时前提，不是本仓测试前提）\n'
  exit 0
fi
unset SPECIFY_INIT_DIR  # get_repo_root() 优先读该环境变量，夹具必须只认 cwd
export PYTHONDONTWRITEBYTECODE=1  # 禁止 python 在 skills/ 落 __pycache__（.pyc 内嵌本机路径，会撞结构校验泄漏扫描）

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESOLVER="$REPO_ROOT/skills/ncw-speckit-constitution/scripts/resolve_template.py"
SCAFFOLD_REF="$REPO_ROOT/skills/ncw-speckit-constitution/references/constitution-template.md"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# ---- 夹具与断言辅助 ------------------------------------------------------

write_layer() { # $1 夹具名 $2 层相对路径（如 presets/team-a） $3 标记内容
  mkdir -p "$TMP/$1/.specify/$2"
  printf '%s' "$3" > "$TMP/$1/.specify/$2/constitution-template.md"
}

assert_json_content() { # $1 resolver stdout（JSON） $2 期望 TEMPLATE_NAME $3 期望内容源文件
  node -e '
    const fs = require("fs");
    const name = process.argv[1], src = process.argv[2];
    let j;
    try { j = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(1); }
    process.exit(j.TEMPLATE_NAME === name && j.TEMPLATE_CONTENT === fs.readFileSync(src, "utf8") ? 0 : 1);
  ' "$2" "$3" <<<"$1"
}

run_json() { # $1 夹具名；stdout 赋给 OUT，退出码赋给 RC，stderr 进 $TMP/stderr
  OUT="$(cd "$TMP/$1" && python3 "$RESOLVER" constitution-template --json 2>"$TMP/stderr")"
  RC=$?
}

# ---- 1. 核心层解析（含非 ASCII 内容透传） --------------------------------
fx=case-core
write_layer "$fx" templates '治理核心模板 MARKER-α'
run_json "$fx"
[ "$RC" -eq 0 ] && ok || bad "core: 退出码 $RC（期望 0），stderr: $(cat "$TMP/stderr")"
assert_json_content "$OUT" constitution-template "$TMP/$fx/.specify/templates/constitution-template.md" \
  && ok || bad "core: --json 未原样返回核心层模板（TEMPLATE_NAME/TEMPLATE_CONTENT 不符）"

# ---- 2. scaffold round-trip：references 模板落核心层后字节级可解析 -------
fx=case-scaffold
mkdir -p "$TMP/$fx/.specify/templates"
cp "$SCAFFOLD_REF" "$TMP/$fx/.specify/templates/constitution-template.md"
( cd "$TMP/$fx" && python3 "$RESOLVER" constitution-template >"$TMP/scaffold.out" 2>"$TMP/stderr" )
RC=$?
[ "$RC" -eq 0 ] && ok || bad "scaffold: 退出码 $RC（期望 0），stderr: $(cat "$TMP/stderr")"
cmp -s "$TMP/scaffold.out" "$SCAFFOLD_REF" \
  && ok || bad "scaffold: 非 --json 输出与 references/constitution-template.md 字节不一致"

# ---- 3. extension > core -------------------------------------------------
fx=case-ext
write_layer "$fx" templates 'NCW-CORE-MARKER'
write_layer "$fx" extensions/ext1/templates 'NCW-EXT-MARKER'
run_json "$fx"
[ "$RC" -eq 0 ] && ok || bad "ext>core: 退出码 $RC，stderr: $(cat "$TMP/stderr")"
assert_json_content "$OUT" constitution-template "$TMP/$fx/.specify/extensions/ext1/templates/constitution-template.md" \
  && ok || bad "ext>core: 未取 extension 层内容"

# ---- 4. preset > extension > core ----------------------------------------
fx=case-preset
write_layer "$fx" templates 'NCW-CORE-MARKER'
write_layer "$fx" extensions/ext1/templates 'NCW-EXT-MARKER'
write_layer "$fx" presets/team-a/templates 'NCW-PRESET-MARKER'
run_json "$fx"
[ "$RC" -eq 0 ] && ok || bad "preset>ext>core: 退出码 $RC，stderr: $(cat "$TMP/stderr")"
assert_json_content "$OUT" constitution-template "$TMP/$fx/.specify/presets/team-a/templates/constitution-template.md" \
  && ok || bad "preset>ext>core: 未取 preset 层内容"

# ---- 5. override > preset > extension > core -----------------------------
fx=case-override
write_layer "$fx" templates 'NCW-CORE-MARKER'
write_layer "$fx" extensions/ext1/templates 'NCW-EXT-MARKER'
write_layer "$fx" presets/team-a/templates 'NCW-PRESET-MARKER'
write_layer "$fx" templates/overrides 'NCW-OVERRIDE-MARKER'
run_json "$fx"
[ "$RC" -eq 0 ] && ok || bad "override>preset>ext>core: 退出码 $RC，stderr: $(cat "$TMP/stderr")"
assert_json_content "$OUT" constitution-template "$TMP/$fx/.specify/templates/overrides/constitution-template.md" \
  && ok || bad "override>…: 未取 overrides 层内容"

# ---- 6. presets/.registry 的 priority 决定取舍 ---------------------------
fx=case-registry
mkdir -p "$TMP/$fx/.specify/presets"
printf '%s' '{"presets":{"slow":{"priority":99},"fast":{"priority":1}}}' > "$TMP/$fx/.specify/presets/.registry"
write_layer "$fx" presets/fast/templates 'NCW-FAST-MARKER'
write_layer "$fx" presets/slow/templates 'NCW-SLOW-MARKER'
run_json "$fx"
[ "$RC" -eq 0 ] && ok || bad "registry: 退出码 $RC，stderr: $(cat "$TMP/stderr")"
assert_json_content "$OUT" constitution-template "$TMP/$fx/.specify/presets/fast/templates/constitution-template.md" \
  && ok || bad "registry: priority=1 的 preset 未胜出"

# ---- 7. 全层缺失 → 非零退出 + stderr 报错（scaffold 触发条件） ------------
fx=case-missing
mkdir -p "$TMP/$fx/.specify"
run_json "$fx"
[ "$RC" -ne 0 ] && ok || bad "missing: 期望非零退出，实际 0，stdout: $OUT"
grep -q 'Could not resolve required constitution-template' "$TMP/stderr" \
  && ok || bad "missing: stderr 未报缺模板（实际: $(cat "$TMP/stderr")）"

# ---- 8. 非安全模板名被拒绝 -----------------------------------------------
fx=case-safename
mkdir -p "$TMP/$fx/.specify/templates"
OUT="$(cd "$TMP/$fx" && python3 "$RESOLVER" Bad_Name --json 2>"$TMP/stderr")"
RC=$?
[ "$RC" -ne 0 ] && ok || bad "safename: 期望非零退出，实际 0，stdout: $OUT"
grep -q 'Could not resolve required Bad_Name' "$TMP/stderr" \
  && ok || bad "safename: stderr 未报模板名不可解析（实际: $(cat "$TMP/stderr")）"

printf 'speckit-constitution: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
