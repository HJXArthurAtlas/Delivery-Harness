#!/usr/bin/env node
// 技能 pack 安装器：把本 pack 的技能目录拷入各端 skill 发现目录。
// 本脚本随 ncw-monorepo-init 技能分发，是整个 pack（PACK_SKILLS 列表）的统一安装入口；
// 新增 pack 技能时在 PACK_SKILLS 里加一行，不要复制本脚本。
//
// 覆盖矩阵（项目级同名覆盖全局级）：
//   .agents/skills/   → DSH / OpenCode / omp
//
// 用法：
//   node sync.mjs               # 项目级：拷入 <cwd>/.agents/skills/
//   node sync.mjs --global      # 用户级：拷入 ~/.agents/skills/
//   node sync.mjs --dry-run     # 只打印计划，不写盘
//   node sync.mjs --force       // 同名覆盖（默认跳过并列出冲突）
//   node sync.mjs --help
//
// 安全边界与技能一致：同名不覆盖；源目录与目标重合时跳过（防止在本仓内自拷贝）。

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACK_SKILLS = ["ncw-monorepo-init", "ncw-speckit-analyze", "ncw-speckit-clarify", "ncw-speckit-constitution", "ncw-speckit-converge", "ncw-speckit-flow", "ncw-speckit-implement", "ncw-speckit-plan"];

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(
    [
      "用法: node sync.mjs [--global] [--dry-run] [--force]",
      "",
      `  pack 技能: ${PACK_SKILLS.join(", ")}`,
      "  --global    装到用户级 ~/.agents/skills/（默认项目级 <cwd>/...）",
      "  --dry-run   只打印计划，不写盘",
      "  --force     同名覆盖（默认跳过并列出冲突）",
    ].join("\n"),
  );
  process.exit(0);
}

const global = args.includes("--global");
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const unknown = args.filter((a) => !["--global", "--dry-run", "--force"].includes(a));
if (unknown.length > 0) {
  console.error(`未知参数: ${unknown.join(" ")}（--help 查看用法）`);
  process.exit(1);
}

const thisSkill = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = dirname(thisSkill); // <pack 仓>/skills/
const base = global ? homedir() : process.cwd();
if (!global && existsSync(join(base, "skills", PACK_SKILLS[0]))) {
  console.error("当前目录是 pack 仓本身，项目级安装无意义；加 --global 装到用户级。");
  process.exit(1);
}
const targetRoots = [join(base, ".agents", "skills")];

const sources = PACK_SKILLS.map((name) => {
  const dir = join(skillsRoot, name);
  if (!existsSync(join(dir, "SKILL.md"))) {
    console.error(`缺 SKILL.md: ${dir}（PACK_SKILLS 列表与实际目录不一致）`);
    process.exit(1);
  }
  return dir;
});

let copied = 0;
let skipped = 0;
for (const root of targetRoots) {
  for (const src of sources) {
    const dest = join(root, basename(src));
    if (resolve(dest) === src) {
      console.log(`SKIP（源与目标重合）${dest}`);
      continue;
    }
    const exists = existsSync(dest);
    if (exists && !force) {
      console.log(`SKIP（同名已存在，--force 覆盖）${dest}`);
      skipped++;
      continue;
    }
    const verb = dryRun ? "PLAN" : exists ? "OVERWRITE" : "COPY";
    console.log(`${verb}  ${src} -> ${dest}`);
    if (!dryRun) {
      mkdirSync(root, { recursive: true });
      if (exists) rmSync(dest, { recursive: true, force: true });
      cpSync(src, dest, { recursive: true });
    }
    copied++;
  }
}

if (!dryRun) {
  console.log(
    `\n完成: 拷贝 ${copied} 个目标${skipped ? `，跳过 ${skipped} 个同名` : ""}。` +
      `\n生效范围: .agents/skills/ → DSH / OpenCode / omp。` +
      `${global ? "" : "\n提示: 项目内安装由 init 流程的 pack 安装步完成，已初始化项目通常无需手动 sync。"}`,
  );
}
