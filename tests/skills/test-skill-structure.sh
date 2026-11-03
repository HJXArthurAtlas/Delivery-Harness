#!/usr/bin/env bash
# 技能结构校验：不依赖 LLM 的静态检查。
# 移植自 superpowers tests/diagnosing-superpowers/test-skill-structure.sh，按本仓约定裁剪：
#   - 保留：frontmatter 校验、引用文件存在性、泄漏扫描、[PASS]/[FAIL] 计数
#   - 裁剪：superpowers 专属规则（"Use when" 前缀、## Hard rules 标题、词数预算、第二人称策略）
#   - 新增：.agents/commands/ 斜杠命令 frontmatter 校验，禁止工具专属 .omp/commands/
#   - 新增：.omp-plugin/marketplace.json 目录校验（JSON 合法、命名合规、source 恰为 "./"、
#     version 与 package.json 同步），并禁止 .omp-plugin/plugin.json（防 remap 把 .agents/ 带进 omp 插件安装面）
#   - 新增：DSH bundle 分发面校验（dsh.bundle.patch 指向 cordis.patch.yml、main 入口、
#     files 三件套、engines.dsh 兼容范围、patch 行引用包名、入口导出 apply、无路径泄漏）
#   - 新增：每个 SKILL.md 顶部语言规则块（读 .che/config.yml 的 language 决定全 pack 输出语言）
set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SKILLS_DIR="$REPO_ROOT/skills"

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

  # 2. name 与目录名一致；命名格式 che-<name>（至少两段 kebab），且简洁（≤32 字符）
  name="$(awk -F': *' '/^name:/{print $2; exit}' "$skill_md")"
  [ "$name" = "$skill" ] && ok || bad "$skill: name '$name' 与目录名不一致"
  [[ "$skill" =~ ^che-[a-z0-9]+(-[a-z0-9]+)*$ ]] && ok || bad "$skill: 命名不符 che-<name> 格式"
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
  #    ——跨技能引用（如 grill-with-docs 指向 che-adr-draft 的 scaffold.sh）属此类。
  while IFS= read -r ref; do
    case "$ref" in
      references/*|scripts/*)
        [ -e "$skill_dir$ref" ] && ok || bad "$skill: SKILL.md 引用缺失 $ref" ;;
      *) ok ;; # 安装位/宿主路径，运行时解析
    esac
  done < <(grep -oE '`[^`]+`' "$skill_md" | tr -d '`' | grep -E '(references|scripts)/' | sort -u)

  # 4b. 语言规则块：SKILL.md 顶部必须声明 pack 语言配置（.che/config.yml 的 language）
  grep -Eq '^> \*\*语言规则（pack fork.*\.che/config\.yml' "$skill_md" \
    && ok || bad "$skill: SKILL.md 顶部缺少语言规则块（读 .che/config.yml 的 language 决定输出语言）"
done

# 5. 泄漏扫描：技能与 omp 目录文件不得含本机绝对路径
if grep -rn '/Users/\|/home/' "$SKILLS_DIR" "$REPO_ROOT/.omp-plugin" >/dev/null 2>&1; then
  bad "泄漏扫描：skills/ 或 .omp-plugin/ 内出现 /Users/ 或 /home/ 路径"
else
  ok
fi

# 6. 斜杠命令走通用发现路径 .agents/commands/（omp/DSH/OpenCode 均读 .agents/ 族），禁止回退工具专属 .omp/commands/
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

# 7. omp marketplace 目录：.omp-plugin/marketplace.json 合法、命名合规、source 锁定 "./"、版本与 package.json 同步
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

# 8. omp 插件仅分发 skills/：禁止 manifest remap 把 .agents/ 等仓内目录带进安装面
if [ -e "$REPO_ROOT/.omp-plugin/plugin.json" ]; then
  bad ".omp-plugin/plugin.json 不允许存在（remap 会把 .agents/ 带进 omp 插件；斜杠命令仍走 .agents/commands/）"
else
  ok
fi

# 8b. omp 启动更新检查扩展：package.json omp.extensions 必须声明 omp-update-check.ts 且文件存在；
#     行为冒烟（mock pi/ctx + 新鲜缓存，不连网）：远端更新则 notify、已是最新则静默
if command -v node >/dev/null 2>&1; then
  node -e 'process.exit(process.features.typescript ? 0 : 1)' 2>/dev/null || {
    # 无 type stripping 时仅做声明校验
    node -e '
      const fs = require("node:fs");
      const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      const entries = pkg?.omp?.extensions;
      const good = Array.isArray(entries) && entries.length > 0 &&
        entries.every((e) => fs.existsSync(require("node:path").join(process.argv[2], e)));
      process.exit(good ? 0 : 1);
    ' "$REPO_ROOT/package.json" "$REPO_ROOT" && ok || bad "omp.extensions 声明缺失或入口文件不存在"
  }
  if node -e 'process.exit(process.features.typescript ? 0 : 1)' 2>/dev/null; then
    SMOKE_TMP="$(mktemp -d)"
    TMP_STDERR_8B="$SMOKE_TMP/stderr"
    XDG_CACHE_HOME="$SMOKE_TMP" node --input-type=module -e '
      import { pathToFileURL } from "node:url";
      import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
      const root = process.argv[1];
      const mod = await import(pathToFileURL(root + "/omp-update-check.ts").href);
      let handler = null;
      mod.default({ on: (event, h) => { if (event === "session_start") handler = h; } });
      if (typeof handler !== "function") { console.error("FAIL session_start 未注册"); process.exit(1); }
      const installed = JSON.parse(readFileSync(root + "/package.json", "utf8")).version;
      const cacheDir = process.env.XDG_CACHE_HOME + "/ncw-delivery-harness";
      const scenario = process.argv[2];
      mkdirSync(cacheDir, { recursive: true });
      const latest = scenario === "newer" ? "v999.0.0" : "v0.0.1";
      writeFileSync(cacheDir + "/omp-update-check.json", JSON.stringify({ latest, checkedAt: Date.now() }));
      const notes = [];
      await handler({}, { hasUI: true, ui: { notify: (m) => notes.push(m) } });
      const wantNotify = scenario === "newer";
      if (wantNotify) {
        const ok = notes.length === 1 && notes[0].includes("v999.0.0") && notes[0].includes(installed) &&
          notes[0].includes("omp plugin upgrade ncw-delivery@ncw-delivery-harness");
        if (!ok) { console.error("FAIL 更新通知不符: " + JSON.stringify(notes)); process.exit(1); }
      } else if (notes.length !== 0) {
        console.error("FAIL 已是最新不应通知: " + JSON.stringify(notes)); process.exit(1);
      }
      console.log("OK");
    ' "$REPO_ROOT" newer >/dev/null 2>"$TMP_STDERR_8B" && ok || bad "omp 更新检查冒烟(有新版): $(cat "$TMP_STDERR_8B" 2>/dev/null)"
    XDG_CACHE_HOME="$SMOKE_TMP" node --input-type=module -e '
      import { pathToFileURL } from "node:url";
      import { mkdirSync, writeFileSync } from "node:fs";
      const root = process.argv[1];
      const mod = await import(pathToFileURL(root + "/omp-update-check.ts").href);
      let handler = null;
      mod.default({ on: (event, h) => { if (event === "session_start") handler = h; } });
      const cacheDir = process.env.XDG_CACHE_HOME + "/ncw-delivery-harness";
      mkdirSync(cacheDir, { recursive: true });
      writeFileSync(cacheDir + "/omp-update-check.json", JSON.stringify({ latest: "v0.0.1", checkedAt: Date.now() }));
      const notes = [];
      await handler({}, { hasUI: true, ui: { notify: (m) => notes.push(m) } });
      if (notes.length !== 0) { console.error("FAIL 已是最新不应通知"); process.exit(1); }
      console.log("OK");
    ' "$REPO_ROOT" >/dev/null 2>"$TMP_STDERR_8B" && ok || bad "omp 更新检查冒烟(已最新): $(cat "$TMP_STDERR_8B" 2>/dev/null)"
    rm -rf "$SMOKE_TMP"
  fi
else
  bad "omp 扩展校验需要 node"
fi

# 9. @adrkit/cli 运行时依赖：必须钉精确版本，且 omp manifest 存在；分发包 private（不发 npm——发布面只有 omp/DSH 插件与 @newchiwan/che）
if command -v node >/dev/null 2>&1; then
  while IFS= read -r line; do
    case "$line" in OK) ok ;; FAIL\ *) bad "${line#FAIL }" ;; esac
  done < <(node -e '
const fs = require("node:fs");
const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const dep = pkg.dependencies && pkg.dependencies["@adrkit/cli"];
if (!dep || !/^\d+\.\d+\.\d+$/.test(dep)) {
  console.log(`FAIL package.json 依赖 @adrkit/cli 必须钉精确版本，当前为 ${dep || "缺失"}`);
} else if (!pkg.omp || typeof pkg.omp !== "object") {
  console.log("FAIL package.json 缺少 omp manifest（git/npm 插件安装路径的运行时技能发现依赖它）");
} else if (pkg.private !== true) {
  console.log("FAIL package.json 必须 private: true（分发包不发 npm，防误发）");
} else {
  console.log("OK");
}
' "$REPO_ROOT/package.json")
else
  bad "adrkit 依赖版本钉校验需要 node（engines 要求 >=22）"
fi

# 10. DSH bundle 分发面：根包兼作 DSH 组合包（cordis.patch.yml + dsh-entry.js + package.json 三处一致）
if command -v node >/dev/null 2>&1; then
  while IFS= read -r line; do
    case "$line" in OK) ok ;; FAIL\ *) bad "${line#FAIL }" ;; esac
  done < <(node -e '
const fs = require("node:fs");
const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const entryPath = process.argv[2];
const patchPath = process.argv[3];
const msgs = [];
const patch = pkg.dsh && pkg.dsh.bundle && pkg.dsh.bundle.patch;
if (patch !== "./cordis.patch.yml") {
  msgs.push(`FAIL package.json dsh.bundle.patch 必须为 "./cordis.patch.yml"，当前为 ${JSON.stringify(patch ?? null)}`);
}
const hasEntry = fs.existsSync(entryPath);
if (pkg.main !== "dsh-entry.js" || !hasEntry) {
  msgs.push("FAIL package.json main 必须指向存在的 dsh-entry.js（DSH bundle 插件入口）");
}
if (!fs.existsSync(patchPath)) {
  msgs.push("FAIL cordis.patch.yml 不存在（dsh.bundle.patch 指向的组合包层）");
} else {
  const patchText = fs.readFileSync(patchPath, "utf8");
  if (!/^\s*- insert:/m.test(patchText) || !patchText.includes(`name: ${pkg.name}`)) {
    msgs.push("FAIL cordis.patch.yml 必须 insert 一行 name 指向 package.json 的包名");
  }
}
for (const f of ["skills", "dsh-entry.js", "cordis.patch.yml"]) {
  if (!Array.isArray(pkg.files) || !pkg.files.includes(f)) {
    msgs.push(`FAIL package.json files 必须包含 ${f}（npm tarball 分发面）`);
  }
}
const engines = pkg.engines || {};
if (typeof engines.dsh !== "string" || !engines.dsh.trim()) {
  msgs.push("FAIL package.json engines.dsh 必须声明 DSH 兼容范围（安装时 fail-closed）");
}
if (typeof engines.che !== "string" || !/^>=\d+\.\d+\.\d+$/.test(engines.che.trim())) {
  msgs.push("FAIL package.json engines.che 必须声明 pack 所需 che CLI 最低版本（形如 >=x.y.z；che pack 安装时抄入 .che/pack.json）");
} else {
  // engines.che 引用的 CLI 版本必须已存在于 packages/cli（未发布也会在下次 publish 时兑现）。
  const repoRoot = process.argv[1].replace(/[\\/][^\\/]*$/, "");
  let cliPkg = null;
  try { cliPkg = JSON.parse(fs.readFileSync(repoRoot + "/packages/cli/package.json", "utf8")); } catch {}
  if (!cliPkg || typeof cliPkg.version !== "string") {
    msgs.push("FAIL packages/cli/package.json 缺失或无 version");
  } else {
    const required = engines.che.trim().replace(/^>=/, "");
    const parts = (v) => v.split(".").map((x) => Number.parseInt(x, 10) || 0);
    const [aR, bR, cR] = parts(required), [aC, bC, cC] = parts(cliPkg.version);
    const cmp = (aR - aC) || (bR - bC) || (cR - cC);
    if (cmp > 0) {
      msgs.push(`FAIL engines.che (${engines.che}) 高于 packages/cli 当前版本 ${cliPkg.version}——先 bump 并发布 CLI`);
    }
  }
}
if (hasEntry) {
  const entry = fs.readFileSync(entryPath, "utf8");
  if (!entry.includes("registerProvider") || !/export function apply/.test(entry)) {
    msgs.push("FAIL dsh-entry.js 必须导出 apply 并调用 ctx.skills.registerProvider");
  }
}
for (const f of [entryPath, patchPath]) {
  if (fs.existsSync(f) && /\/Users\/|\/home\//.test(fs.readFileSync(f, "utf8"))) {
    msgs.push(`FAIL ${f} 含本机绝对路径（泄漏）`);
  }
}
if (msgs.length === 0) console.log("OK");
for (const m of msgs) console.log(m);
' "$REPO_ROOT/package.json" "$REPO_ROOT/dsh-entry.js" "$REPO_ROOT/cordis.patch.yml")
else
  bad "DSH bundle 校验需要 node（engines 要求 >=22）"
fi

printf 'skill-structure: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
