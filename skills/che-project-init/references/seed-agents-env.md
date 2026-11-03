## 环境检查（仅用户明确要求时执行）

环境检查不随会话自动触发；仅当用户明确要求执行环境检查时，Agent 才把下表所有项目全量检查一遍：任何一项不符合都不要当场安装/升级，全部查完后中断对话，向我汇报不符合的项目并逐项询问是否按「安装 / 升级」列处理，经我确认才执行。安装属初始化动作，检查只在缺失或版本不符时补装，正常时不要重装。确认安装后检测仍不符的，排查同名工具多份安装（nvm / vfox / homebrew / install.sh 并存），对 PATH 里实际生效的那份重装（macOS/Linux 用 `which <工具>`，Windows 用 `Get-Command <工具>`）。

<!-- 依赖面以 ncw-delivery-harness 为准：che / adrkit / pingcode（条件）+ 宿主技能发现；spec-kit CLI 与其四个扩展已被 pack 技能吸收替代，AOCI 已停用（存档 aoci-init-backup.md），均不再检查 -->

| 工具 | 期望版本 | 检测 | 安装 / 升级 |
|---|---|---|---|
| Node.js | ≥ 22.18（che 与技能包硬性要求） | `node --version` | 按系统装 22+ LTS（≥ 22.18）：macOS 用 brew / nvm，Windows 用 winget / choco，Linux 用 apt / dnf（本机有多个包管理器时问用户选哪个）；都没有则从 [nodejs.org](https://nodejs.org) 装 LTS |
| 团队技能包 ncw-delivery-harness | 跟踪 main 最新 | 跑宿主更新命令即完成检查：omp `omp plugin upgrade ncw-delivery@ncw-delivery-harness`；dsh `dsh plugin --profile <name> update ncw-delivery-harness`。命令成功即合规（已是最新为 no-op）；有更新则已当场升至最新，装完提示重启生效（本行更新即检查动作本身，不需确认） | omp：无 marketplace 先 `omp plugin marketplace add https://git.newchiwan.com/council/ncw-delivery-harness.git`，再 `omp plugin install ncw-delivery@ncw-delivery-harness --force`；dsh：`dsh plugin --profile <name> add git+https://git.newchiwan.com/council/ncw-delivery-harness.git`；非 omp/dsh 宿主按 [harness README](https://git.newchiwan.com/council/ncw-delivery-harness)「一键安装（For Agent）」内嵌提示词执行 |
| che CLI（@newchiwan/che） | 与 Nexus 上 `latest` 一致 | `che --version` 与 `npm view @newchiwan/che version --registry https://nexus.newchiwan.cn/repository/registry-npm/` 输出一致即合规；命令失败、缺装或版本不一致均不符 | 缺失或非最新时先 `npm config set @newchiwan:registry https://nexus.newchiwan.cn/repository/registry-npm/`，再 `npm i -g @newchiwan/che@latest`（包只发公司 Nexus，公网 404） |
| adr（adrkit CLI） | 0.20.0 | `adr --version`，输出为 `0.20.0` 即合规 | `npm i -g @adrkit/cli@0.20.0` |
| pingcode CLI | ≥ 0.14.0 | 仅接入 PingCode 的项目检查，判据：`.che/config.yml` 为 `pingcode_integration: on` 且 `.che/pingcode-config.yml` 在位（二者由 /che-project-init 与 /che-pingcode-init 生成，任一不满足视为未接入、不检查）；合规检测 `pingcode -v`，输出版本号 ≥ `0.14.0` 即合规 | 缺装时 `npm i -g @metaphorli/pingcode-cli@latest`（che-pingcode-* 五技能依赖）；未接入时不装 |
| 跨模型 CLI（codex / gemini / claude） | 条件性 | 默认 `auto` 策略不需要 | 仅当 .che/config.yml 的 checker 策略强制 `cross-model` 或 `cli:model` 时对应 CLI 需在 PATH（macOS/Linux 用 `command -v <cli>`、Windows 用 `Get-Command <cli>`，可达即合规），默认不装不查 |
| codegraph | 1.6.2 | `codegraph --version`，输出 `1.6.2` 即合规 | `npm i -g @colbymchenry/codegraph@1.6.2` |
| codegraph 索引（项目级） | 已初始化 | 项目根目录跑 `codegraph status`，出现 `Not initialized` 即未初始化 | 未初始化：列入不符合项，经我确认后执行 `codegraph init`；已初始化：默认执行一次 `codegraph sync` 刷新索引（这是检查动作本身，不需确认） |
