---
description: 发版流程——自动探测 pack / che CLI 各自是否需发、生成建议版本号、经用户确认后直接发布（私有 Nexus + git tag）；用户说「发布 / 发版 / 升版本 / 打 tag / 出新版本」时执行
---

# release

本仓只有一条发版路径：**根 `package.json#version` 是 pack 唯一版本源（omp 插件与 DSH bundle 共用），git tag `vX.Y.Z` 是 che 安装通道的发布原语**（没打 tag = che 通道没发版）。CLI 版本源是 `packages/cli/package.json`（须与 `src/version.ts` 的 `CLI_VERSION` 一致，测试强制）。绝不手工 bump + push。

## 前置

工作树必须干净、main 与 origin 同步（先 `git pull --ff-only`）；不满足即停下处理，不发版。

## 第 0 步：探测发版面（只读，不改文件）

```bash
last_tag="$(git describe --tags --match 'v*' --abbrev=0 2>/dev/null || true)"
git log --oneline "${last_tag:-v0.0.0}..HEAD" -- . ':!packages/cli'   # pack 改动（自最新 tag，已 push 与否一律计入）
cli_base="$(git log -n1 --format=%H -- packages/cli/package.json packages/cli/src/version.ts)"
git log --oneline "${cli_base:-v0.0.0}..HEAD" -- packages/cli         # CLI 改动（自上次 CLI 发布回写提交）
bash release.sh --check; echo "rc=$?"   # 0=本地 CLI 版本未上 Nexus；1=已在线上；2=读不到 Nexus，先解决
node -p 'require("./package.json").version'                            # 根版本（对照最新 tag 查漏 tag）
```

判定（锚点纪律：pack 面锚定最新 tag，CLI 面锚定上次 CLI 发布——都绝不是 origin/main 或未 push 提交）：
- **pack 需发**：最新 tag 后存在非 `packages/cli` 提交（含文档/分发面）；或根版本 > 最新 tag（上次漏 tag 的中间态，并入本次发版）。
- **CLI 需发**：上次 CLI 发布回写提交之后存在 `packages/cli` 提交；或 `release.sh --check` rc=0（版本已 ahead，必发，以 rc 为准）。上次 CLI 发布回写提交 = `packages/cli/package.json` 或 `src/version.ts` 最近一次提交——CLI 发布不打 tag（tag 只承载 pack 通道），禁止用 pack tag 锚定 CLI 面，否则仅 CLI 发版后其发布提交落在 tag 后会误判。
- 两面都无 → 回报「无可发内容」结束，不 bump、不打 tag。

## 第 1 步：自动生成建议版本号（pack 与 CLI 各自独立套用 semver）

| 变化 | bump |
|---|---|
| 修 bug、文档小修 | patch |
| 加技能、加功能、加配置键 | minor |
| 删技能、技能更名、改配置键语义、改 manifest schema | major |

CLI 按其提交内容同口径 bump。唯一耦合点：pack 用到 CLI 新能力时抬根 `engines.che`（不得高于已发布 CLI 版本，测试拦截），随 pack 同次发版。

## 第 2 步：向用户确认（必经；未确认不得写盘、不得推送、不得打 tag）

确认内容固定四项：
1. **改了什么**：按面归类的 git log（pack 面 / CLI 面）。
2. **之前版本**：pack = 最新 tag 与根版本；CLI = Nexus 最新版与本地版本。
3. **建议版本**：各自新版本号 + bump 理由。
4. **将执行的动作**：第 3 步将跑的命令清单（release.sh / 发布文档生成 / npm test / commit / tag / push / GitLab Release）。

用户改口径则按用户版本号执行；确认后第 3 步全自动，不再逐条询问。

## 第 3 步：确认后自动发布（先 CLI，后 pack——`engines.che` 引用已存在的版本）

- **CLI 需发**：`bash release.sh <CLI新版本>` —— 自动回写 `packages/cli/package.json` 与 `src/version.ts`、核对 Nexus 最新性、bun 打包并推送私有 Nexus。失败即停；需用户级 `~/.npmrc` devops 认证（见 README「发布」），缺认证直接报告，不代填凭据。
  - pack 同发：CLI 两文件并入 pack bump 提交。
  - 仅 CLI 发版：单独提交 `chore(release): che CLI <版本>` 推 main，**不打 tag**（tag 只承载 pack 通道）；不生成 pack 发布文档，其改动并入下次 pack 发布文档的「CLI 变化」节。
- **pack 需发**：
  1. bump 三处：根 `package.json#version`、`.omp-plugin/marketplace.json` 的 plugin `version`（不一致被测试拦下）、`docs/guides/AI Native实践指南.md` 版本对齐行（pack 版 + 本版 CLI 版）。
  2. 生成发布文档 `docs/releases/<X.Y.Z>.md`（内容口径见「发布文档」节），并入 bump 提交。
  3. `npm test` 全绿（三个脚本依次跑）。
  4. 单提交 `chore(release): 发布 X.Y.Z`：只含根 `package.json`、`.omp-plugin/marketplace.json`、指南、`docs/releases/<X.Y.Z>.md`、本版动过的 `packages/cli` 两文件。
  4. 原子发布（一条命令推 main 与 tag，无中间态）：
     ```bash
     git tag vX.Y.Z   # 打在步骤 3 的提交上
     git push origin main vX.Y.Z
     ```
  5. 创建 GitLab Release（基于已推 tag，发布说明即 `docs/releases/<X.Y.Z>.md`）：
     ```bash
     GITLAB_HOST=git.newchiwan.com glab release create vX.Y.Z \
       --notes-file "docs/releases/X.Y.Z.md" -R council/ncw-delivery-harness
     ```
     glab 未配置该主机时先 `glab auth login --hostname git.newchiwan.com`（需 api scope 的 PAT）；无 glab 时走 GitLab API（`POST /projects/:id/releases`，`PRIVATE-TOKEN` 认证）。认证缺失直接报告，不代填凭据；失败即停，补建后重跑本步与 postcondition。仅 CLI 发版无 tag，不创建 GitLab Release。

## 发布文档（docs/releases/<版本号>.md）

pack 每次发版必须在 bump 提交内生成 `docs/releases/<X.Y.Z>.md`（版本号不带 `v` 前缀），随 tag 一起发布，作为该版本的发布说明。内容为 Markdown 要点列表（不用表格），固定结构：

- **头部**：版本号 + 发版日期（tag 提交日期）。
- **修改清单**：按当版实际主题分组的要点（主链 / 交互契约 / 集成改造 / 校验与门禁 / 文档与版本等），一条一个可观察变化，不写流水账 commit 标题。
- **CLI 变化**：本版 CLI 改动列表；无则写「无」。

素材直接取自第 0 步面探测的 git log，不新增未发生的声明；历史发布文档只增不改。

## 第 4 步：postcondition（硬校验，失败即整次发版判 FAIL）

```bash
git ls-remote --tags origin "refs/tags/vX.Y.Z" | grep -q "refs/tags/vX.Y.Z$" \
  && echo OK || echo "FAIL: tag 未生效，che 通道未发版"
test -f "docs/releases/X.Y.Z.md" \
  && echo OK || echo "FAIL: 发布文档 docs/releases/X.Y.Z.md 缺失"
GITLAB_HOST=git.newchiwan.com glab release view vX.Y.Z -R council/ncw-delivery-harness >/dev/null \
  && echo OK || echo "FAIL: GitLab Release 未创建"
npm view @newchiwan/che version --@newchiwan:registry=https://nexus.newchiwan.cn/repository/internal-npm/
```

最后核对 `/readme-refresh` 触发条件（发布方式变化必触发），需要时执行。

## 发版漏 tag 的兜底探测

任何项目跑 `che pack status` 都会比对 main 版本与最新 tag：main > 最新 tag 即报 `CHANNEL_DRIFT` 并给出修复命令（`git tag vX.Y.Z <bump-commit> && git push origin vX.Y.Z`）。人肉发版绕过本流程时，靠这一道必被发现。

## 明确不做

- GitLab CI / push rules 校验（仓内无 CI 定位；push rules 是 Premium 且只能防乱打 tag）。
- `npm test` 校验 tag（bump 提交先于 tag 的窗口期必然误报）。

**Input**: 可选，目标版本号；给了则跳过第 1 步建议，仍走第 2 步确认
**Provided arguments**: $@
