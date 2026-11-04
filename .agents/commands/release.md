---
description: 发版流程——统一版本源、双版本 bump、原子打 tag 与 postcondition 校验；用户说「发布 / 发版 / 升版本 / 打 tag / 出新版本」时执行
---

# release

本仓只有一条发版路径：**根 `package.json#version` 是 pack 唯一版本源，git tag `vX.Y.Z` 是 che 安装通道的发布原语**。没打 tag = che 通道没发版。绝不手工 bump + push。

## 版本号口径（semver）

| 变化 | bump |
|---|---|
| 修 bug、文档小修 | patch |
| 加技能、加功能、加配置键 | minor |
| **删技能、技能更名、改配置键语义、改 manifest schema** | **major**（消费端可见破坏，如 0.4.0 的 che-* 更名） |

双版本解耦：技能/文档/分发面变化 → 只 bump 根版本；CLI 行为变化 → 只 bump `packages/cli`。唯一耦合点：pack 用到 CLI 新能力时抬高根 `engines.che`，随 pack 同次发版。

## 步骤（每步有可判定通过条件，失败即停）

1. **定版本号**：按上表口径确定 `X.Y.Z`；先 `git log --oneline <上个tag>..HEAD` 核对本版内容再定。
2. **本版含 CLI 变更时**：`bash release.sh X.Y.Z` 发布 Nexus（回写 `packages/cli/package.json` 与 `src/version.ts` 的 `CLI_VERSION`、核对线上最新版后推送；两者不一致会被 `test-che-cli.sh` 拦下；需 devops 认证，见 README「发布」）。**先发 CLI 再 bump pack**——`engines.che` 引用已存在的版本。
3. **bump pack**：根 `package.json#version` = `X.Y.Z`，同步 `.omp-plugin/marketplace.json` 的 plugin `version`（不一致被 `test-skill-structure.sh` 拦下）与 `docs/guides/AI Native实践指南.md` 顶部「版本对齐」行（pack 版本 + 本版对应的 CLI 版本）。
4. **质量门**：`npm test` 必须全绿（三个脚本依次跑）。
5. **单提交**：`chore(release): 发布 X.Y.Z`，只含根 `package.json`、`.omp-plugin/marketplace.json`（及本版动过的 `packages/cli` 两文件）。
6. **原子发布**：一条命令同时推 main 与 tag，不存在「先推 main、tag 下次补」的中间态：
   ```bash
   git tag vX.Y.Z   # 打在步骤 5 的提交上
   git push origin main vX.Y.Z
   ```
6.1. **postcondition（硬校验，失败即整次发版判 FAIL）**：
   ```bash
   git ls-remote --tags origin "refs/tags/vX.Y.Z" | grep -q "refs/tags/vX.Y.Z$" \
     && echo OK || echo "FAIL: tag 未生效，che 通道未发版"
   ```
7. **README**：核对 `/readme-refresh` 触发条件（发布方式变化必触发），需要时执行。

## 发版漏 tag 的兜底探测

任何项目跑 `che pack status` 都会比对 main 版本与最新 tag：main > 最新 tag 即报 `CHANNEL_DRIFT` 并给出修复命令（`git tag vX.Y.Z <bump-commit> && git push origin vX.Y.Z`）。人肉发版绕过本流程时，靠这一道必被发现。

## 明确不做

- GitLab CI / push rules 校验（仓内无 CI 定位；push rules 是 Premium 且只能防乱打 tag）。
- `npm test` 校验 tag（bump 提交先于 tag 的窗口期必然误报）。

**Input**: 可选，目标版本号；不给则按步骤 1 口径现定
**Provided arguments**: $@
