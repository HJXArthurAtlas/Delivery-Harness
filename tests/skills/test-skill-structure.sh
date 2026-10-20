#!/usr/bin/env bash
# 技能结构校验：不依赖 LLM 的静态检查。
# 移植自 superpowers tests/diagnosing-superpowers/test-skill-structure.sh，按本仓约定裁剪：
#   - 保留：frontmatter 校验、引用文件存在性、泄漏扫描、[PASS]/[FAIL] 计数
#   - 裁剪：superpowers 专属规则（"Use when" 前缀、## Hard rules 标题、词数预算、第二人称策略）
#   - 新增：sync.mjs PACK_SKILLS 必须与 skills/ 目录一致（新增技能忘登记安装器的防呆；
#     唯一已接受偏差走测试内显式别名表）
#   - 新增：.agents/commands/ 斜杠命令 frontmatter 校验，禁止工具专属 .omp/commands/
#   - 新增：.omp-plugin/marketplace.json 目录校验（JSON 合法、命名合规、source 恰为 "./"、
#     version 与 package.json 同步），并禁止 .omp-plugin/plugin.json（防 remap 把 .agents/ 带进 omp 插件安装面）
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

  # 4. SKILL.md 引用的 references/、scripts/ 文件必须存在（引用即契约）。
  #    仅反引号括起的路径参与校验：以 references/ 或 scripts/ 开头的按 pack 内相对引用
  #    校验存在性；其余（.agents/、~/、绝对路径等宿主路径）运行时才有，不在仓内校验
  #    ——跨技能引用（如 grill-with-docs 指向 ncw-adrkit-draft 的 scaffold.sh）属此类。
  #    （.specify/ 已废弃，不再是运行时路径，SKILL.md 不应再引用。）
  while IFS= read -r ref; do
    case "$ref" in
      references/*|scripts/*)
        [ -e "$skill_dir$ref" ] && ok || bad "$skill: SKILL.md 引用缺失 $ref" ;;
      *) ok ;; # 安装位/宿主路径，运行时解析
    esac
  done < <(grep -oE '`[^`]+`' "$skill_md" | tr -d '`' | grep -E '(references|scripts)/' | sort -u)
done

# 5. 泄漏扫描：技能与 omp 目录文件不得含本机绝对路径
if grep -rn '/Users/\|/home/' "$SKILLS_DIR" "$REPO_ROOT/.omp-plugin" >/dev/null 2>&1; then
  bad "泄漏扫描：skills/ 或 .omp-plugin/ 内出现 /Users/ 或 /home/ 路径"
else
  ok
fi

# 6. sync.mjs PACK_SKILLS 与 skills/ 目录一一对应。
#    已知偏差（用户已接受，2026-10 回退 0cea95a 最早版本）：清单固定为原始名
#    monorepo-setup / speckit-flow，经别名对应目录 ncw-monorepo-init / ncw-speckit-flow；
#    其余 23 个技能显式登记为「已知未入清单」。除此之外任何新差异（新技能忘登记
#    安装器、清单新增悬空项、别名对缺任一端）仍会 FAIL。
listed="$(grep -oE '^const PACK_SKILLS = \[.*\];' "$SYNC_SCRIPT" | grep -oE '"[^"]+"' | tr -d '"' | sort)"
actual="$(ls "$SKILLS_DIR" | sort)"
alias_old="monorepo-setup
speckit-flow"
alias_new="ncw-monorepo-init
ncw-speckit-flow"
known_unregistered="ncw-adrkit-check
ncw-adrkit-context
ncw-adrkit-draft
ncw-compound-expectations
ncw-compound-gapfill
ncw-compound-intent
ncw-compound-intentguard
ncw-compound-load
ncw-compound-planverify
ncw-compound-planverify-gate
ncw-compound-require-intent
ncw-compound-writeback
ncw-speckit-analyze
ncw-speckit-clarify
ncw-speckit-constitution
ncw-speckit-converge
ncw-speckit-design
ncw-speckit-grill-me
ncw-speckit-grill-with-docs
ncw-speckit-implement
ncw-speckit-plan
ncw-speckit-specify
ncw-speckit-tasks"
unregistered="$(comm -23 <(echo "$actual") <(printf '%s\n%s\n' "$listed" "$alias_new" | sort -u))"
dangling="$(comm -23 <(echo "$listed") <(printf '%s\n%s\n' "$actual" "$alias_old" | sort -u))"
new_unregistered="$(comm -23 <(echo "$unregistered") <(echo "$known_unregistered" | sort))"
alias_broken=""
while read -r old_name new_name; do
  echo "$listed" | grep -qx "$old_name" && echo "$actual" | grep -qx "$new_name" || alias_broken="${alias_broken}${old_name}↔$new_name "
done < <(paste -d' ' <(echo "$alias_old") <(echo "$alias_new"))
if [ -z "$new_unregistered" ] && [ -z "$dangling" ] && [ -z "$alias_broken" ]; then
  ok
else
  bad "sync.mjs PACK_SKILLS 与 skills/ 目录出现未知差异（已知偏差集除外）：未登记目录（${new_unregistered:-无}）；悬空清单项（${dangling:-无}）；别名对缺端（${alias_broken:-无}）"
fi

# 7. 斜杠命令走通用发现路径 .agents/commands/（omp/DSH/OpenCode 均读 .agents/ 族），禁止回退工具专属 .omp/commands/
if [ -d "$REPO_ROOT/.omp/commands" ]; then
  bad "命令目录必须使用通用 .agents/commands/，发现工具专属 .omp/commands/"
else
  ok
fi
for cmd_md in "$REPO_ROOT"/.agents/commands/*.md; do
  [ -e "$cmd_md" ] || continue
  cmd="$(basename "$cmd_md" .md)"
  [ "$(head -n 1 "$cmd_md")" = "---" ] && ok || bad "命令 $cmd: 首行必须是 ---"
  grep -q '^description: .\+' "$cmd_md" && ok || bad "命令 $cmd: frontmatter 缺少非空 description"
done

# 8. omp marketplace 目录：.omp-plugin/marketplace.json 合法、命名合规、source 锁定 "./"、版本与 package.json 同步
CATALOG="$REPO_ROOT/.omp-plugin/marketplace.json"
if [ ! -f "$CATALOG" ]; then
  bad "omp 目录缺失：.omp-plugin/marketplace.json"
elif command -v node >/dev/null 2>&1; then
  while IFS= read -r line; do
    case "$line" in
      ok) ok ;;
      "bad "*) bad "${line#bad }" ;;
    esac
  done < <(node -e '
const fs = require("node:fs");
const [catalogPath, pkgPath] = process.argv.slice(1);
const out = [];
const ok = () => out.push("ok");
const bad = (m) => out.push(`bad omp 目录：${m}`);
const nameRe = /^[a-z0-9]([-a-z0-9.]{0,62}[a-z0-9])?$/;

let catalog;
try {
  catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  ok();
} catch (e) {
  bad(`marketplace.json 非法 JSON：${e.message}`);
  console.log(out.join("\n"));
  process.exit(0);
}

nameRe.test(catalog.name || "")
  ? ok()
  : bad(`marketplace name "${catalog.name}" 不合规（小写字母/数字开头结尾，可含 - 和 .，≤64）`);

typeof catalog.owner?.name === "string" && catalog.owner.name !== ""
  ? ok()
  : bad("owner.name 缺失或为空");

Array.isArray(catalog.plugins) && catalog.plugins.length > 0
  ? ok()
  : bad("plugins 必须是非空数组");

const plugins = catalog.plugins || [];
const names = plugins.map((p) => (p && typeof p.name === "string" ? p.name : ""));
names.every((n) => nameRe.test(n))
  ? ok()
  : bad(`plugin 名不合规：${names.join(", ") || "(无)"}`);

new Set(names.map((n) => n.toLowerCase())).size === names.length
  ? ok()
  : bad("plugin 名大小写冲突重复");

plugins.every((p) => p && p.source === "./")
  ? ok()
  : bad("plugin source 必须恰为 ./（仓根即插件根，否则 skills/<name> 发现静默失效）");

const declared = plugins.map((p) => (p && typeof p.version === "string" ? p.version : null));
declared.every((v) => v !== null && v.length >= 1 && v.length <= 128 && /^[A-Za-z0-9._+-]+$/.test(v) && !v.includes(".."))
  ? ok()
  : bad(`plugin version 缺失或不合规（缓存路径字符集）：${declared.join(", ") || "(无)"}`);

let pkgVersion = null;
try { pkgVersion = JSON.parse(fs.readFileSync(pkgPath, "utf8")).version ?? null; } catch {}
declared.length > 0 && declared.every((v) => v === pkgVersion)
  ? ok()
  : bad(`catalog version（${declared.join(", ")}）与 package.json version（${pkgVersion}）不一致`);

console.log(out.join("\n"));
' "$CATALOG" "$REPO_ROOT/package.json")
else
  bad "omp 目录校验需要 node（engines 要求 >=22）"
fi

# 9. omp 插件仅分发 skills/：禁止 manifest remap 把 .agents/ 等仓内目录带进安装面
if [ -e "$REPO_ROOT/.omp-plugin/plugin.json" ]; then
  bad ".omp-plugin/plugin.json 不允许存在（remap 会把 .agents/ 带进 omp 插件；斜杠命令仍走 .agents/commands/ + sync.mjs）"
else
  ok
fi

# 10. omp git/npm 插件安装路径的 @adrkit/cli 依赖：版本钉与 bundled runtime 一致，且 omp manifest 存在（无 manifest 时运行时跳过技能扫描）
if command -v node >/dev/null 2>&1; then
  while IFS= read -r line; do
    case "$line" in OK) ok ;; FAIL\ *) bad "${line#FAIL }" ;; esac
  done < <(node -e '
const fs = require("node:fs");
const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const bundle = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const dep = pkg.dependencies && pkg.dependencies["@adrkit/cli"];
if (dep !== bundle.version) {
  console.log(`FAIL package.json 依赖 @adrkit/cli（${dep}）与 adrkit-bundle.json 版本（${bundle.version}）不一致`);
} else if (!pkg.omp || typeof pkg.omp !== "object") {
  console.log("FAIL package.json 缺少 omp manifest（git/npm 插件安装路径的运行时技能发现依赖它）");
} else {
  console.log("OK");
}
' "$REPO_ROOT/package.json" "$REPO_ROOT/skills/ncw-adrkit-draft/scripts/adrkit-bundle.json")
else
  bad "adrkit 依赖版本钉校验需要 node（engines 要求 >=22）"
fi

printf 'skill-structure: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
