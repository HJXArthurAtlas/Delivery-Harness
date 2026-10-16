#!/usr/bin/env bash
# 技能结构校验：不依赖 LLM 的静态检查。
# 移植自 superpowers tests/diagnosing-superpowers/test-skill-structure.sh，按本仓约定裁剪：
#   - 保留：frontmatter 校验、引用文件存在性、泄漏扫描、[PASS]/[FAIL] 计数
#   - 裁剪：superpowers 专属规则（"Use when" 前缀、## Hard rules 标题、词数预算、第二人称策略）
#   - 新增：sync.mjs PACK_SKILLS 必须与 skills/ 目录一致（新增技能忘登记安装器的防呆）
set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SKILLS_DIR="$REPO_ROOT/skills"
SYNC_SCRIPT="$SKILLS_DIR/ncw-monorepo-init/scripts/sync.mjs"

pass=0
fail=0
ok()  { pass=$((pass + 1)); }
bad() { fail=$((fail + 1)); printf '[FAIL] %s\n' "$1"; }

for skill_dir in "$SKILLS_DIR"/*/; do
  skill="$(basename "$skill_dir")"
  skill_md="$skill_dir/SKILL.md"

  # 1. SKILL.md 存在，frontmatter 由 --- 定界
  if [ ! -f "$skill_md" ]; then
    bad "$skill: SKILL.md 缺失"
    continue
  fi
  [ "$(head -n 1 "$skill_md")" = "---" ] && ok || bad "$skill: SKILL.md 首行必须是 ---"
  if [ "$(grep -c '^---$' "$skill_md")" -lt 2 ]; then
    bad "$skill: frontmatter 缺少闭合 ---"
  else
    ok
  fi

  # 2. name 与目录名一致；命名格式 ncw-{submodule}-action（至少三段 kebab），且简洁（≤32 字符）
  name="$(awk -F': *' '/^name:/{print $2; exit}' "$skill_md")"
  [ "$name" = "$skill" ] && ok || bad "$skill: name '$name' 与目录名不一致"
  [[ "$skill" =~ ^ncw-[a-z0-9]+-[a-z0-9]+(-[a-z0-9]+)*$ ]] && ok || bad "$skill: 命名不符 ncw-{submodule}-action 格式"
  [ "${#skill}" -le 32 ] && ok || bad "$skill: 命名过长（${#skill} chars，简洁上限 32）"

  # 3. description 非空、≤1024 字符
  desc_len="$(awk '/^---$/{c++; next} c==1 && /^description:/{sub(/^description: */,""); print length($0); exit}' "$skill_md")"
  if [ -n "$desc_len" ] && [ "$desc_len" -le 1024 ]; then
    ok
  else
    bad "$skill: description 缺失或超长（${desc_len:-0} chars）"
  fi

  # 4. SKILL.md 引用的 references/、scripts/ 文件存在
  while IFS= read -r ref; do
    [ -e "$skill_dir$ref" ] && ok || bad "$skill: SKILL.md 引用缺失 $ref"
  done < <(grep -oE '(references|scripts)/[A-Za-z0-9._-]+' "$skill_md" | sort -u)
done

# 5. 泄漏扫描：技能文件不得含本机绝对路径
if grep -rn '/Users/\|/home/' "$SKILLS_DIR" >/dev/null 2>&1; then
  bad "泄漏扫描：skills/ 内出现 /Users/ 或 /home/ 路径"
else
  ok
fi

# 6. sync.mjs PACK_SKILLS 与 skills/ 目录一一对应
listed="$(grep -oE '^const PACK_SKILLS = \[.*\];' "$SYNC_SCRIPT" | grep -oE '"[^"]+"' | tr -d '"' | sort)"
actual="$(ls "$SKILLS_DIR" | sort)"
[ "$listed" = "$actual" ] && ok || bad "sync.mjs PACK_SKILLS（$(echo "$listed" | tr '\n' ' ')）与 skills/ 目录（$(echo "$actual" | tr '\n' ' ')）不一致"

printf 'skill-structure: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
