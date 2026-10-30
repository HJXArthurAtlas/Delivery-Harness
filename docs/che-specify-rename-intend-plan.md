# che-specify → che-intend 改名计划

日期：2026-10-30
状态：已执行完毕（2026-10-30 落地）

验证记录：`che-specify`、`spec.md` 工件路径、`after_specify`/`before_specify`、`--require-spec` 在 skills/、packages/cli/src、tests/ 零残留；CLI `featureSpec` 值已为 `intent.md`、state 阶段已为 `intend`、校验字段已为 `intent_sha256`；npm test 全绿。

## 已确认决策

- `che-specify` 技能改名 `che-intend`，工件 `spec.md` 改名 `intent.md`。
- 所有 specify 相关一并改：state 阶段名、`--require-spec` flag、hook 键 `after_specify`/`before_specify`、CLI 错误文案。
- `specs/` 任务目录根**不改名**（`spec` 非 `specify` 字面；改名会破坏已接入项目的 `specs/pingcode-mapping.json` 登记路径）。
- `docs/che-compound-specify-simplification-plan.md` 是历史决策记录，**不动**。
- 描述性「规格 / spec」普通名词不改成 intent。

另：che-grill-me → che-grill 已先行完成（`refactor(skills): che-grill-me 改名 che-grill`）。

## 阶段 1：技能本体

| 改动 | 位置 |
|---|---|
| 目录 `skills/che-specify/` → `skills/che-intend/`（git mv） | — |
| frontmatter `name:` + description + 正文 spec.md 路径（约 9 处） | `SKILL.md` L18/L43/L62/L100/L201-202/L234/L329/L362/L375 |
| `references/spec-template.md` → `references/intent-template.md` | SKILL.md L201 唯一活引用同步 |

## 阶段 2：技能间引用（约 22 个文件）

### 命令名 `/che-specify` → `/che-intend`

- che-analyze L162；che-clarify L28/L149/L173；che-constitution L32；che-converge L60；che-design L33
- che-grill L37/L38/L262；che-grill-with-docs L37/L38/L376
- che-intentverify L59/L276；che-load L68/L109；che-planverify L79/L396
- che-project-init L70/L165；che-writeback L25
- che-pingcode-specstoissues L10/L469（hook 键 `after_specify` → `after_intend` 同步改）
- che-load/references/ref.md 6 处
- 三份 `adrkit-lib.sh` 副本错误文案（adr-check/adr-context/adr-draft 各 L55/L59）

### 工件路径 `spec.md` → `intent.md`

- che-clarify（4 处）、che-analyze（4 处）、che-converge（5 处）、che-design（7 处）、che-gapfill（3 处）
- che-grill（13 处）、che-grill-with-docs（14 处）、che-intentverify（2 处）
- che-planverify（3 处，含 L323 `spec_sha256` 哈希契约行）、che-plan（5 处 + plan-template.md + tasks-template.md）
- che-pingcode-specstoissues（5 处）、che-pingcode-sync-cards（2 处）、che-pingcode-init 模板注释
- che-writeback（3 处）、che-load + ref.md

### 配置键

- `after_specify` → `after_intend`（che-pingcode-specstoissues）
- `before_specify` 退役键说明文案（che-project-init L70）同步改

## 阶段 3：CLI 源码（packages/cli/src）

| 文件 | 改动 |
|---|---|
| `feature-paths.ts` | L341 `featureSpec: 'spec.md'` → `'intent.md'`（唯一路径来源）；L164 stage 派生依据；L312 文案；L351-357 `formatPackCommand('specify')` → `'intend'` |
| `state.ts` | L43 stage `'specify'` → `'intend'` |
| `check.ts` | L165/L181 命令渲染；L21 flag `--require-spec` → `--require-intent`；L178-179 文案 |
| `setup.ts` | L162-165 同上 |
| `planverify-gate.ts` | L301-305 哈希字段映射 |

## 阶段 4：测试

- `tests/skills/test-che-cli.sh`：L138/259/351（spec.md 路径断言）、L526-552（stage `specify` → `intend` 断言）
- `tests/skills/test-pack-runtime.sh`：L130/146

## 阶段 5：文档

- `docs/AI Native实践指南.md` L168/190/191/272
- **不动**：`docs/che-compound-specify-simplification-plan.md`、`specs/` 目录、描述性「规格/spec」普通名词

## 验证

1. 每阶段后 `npm test`（结构 / CLI 契约 / 运行时三脚本）。
2. 收尾 grep：`che-specify`、`spec.md`、`after_specify`、`require-spec` 零残留（历史文档除外）。
3. 提交拆分：技能+文档 `refactor(skills): che-specify 改名 che-intend，spec.md 工件更名 intent.md`；CLI+测试 `refactor(cli): …`（或按习惯合并）。

## 已知风险

- hook 键 `after_specify` 改名后，已接入项目 `.che/pingcode-config.yml` 中的旧键失效，需随发布说明告知迁移。
- `--require-intent` flag 无调用方、无测试，改名无兼容负担。
- state 阶段 `specify` → `intend` 影响所有技能中的 `che state start/done specify`，须与 CLI STAGES 常量同步改，漏一处即运行时失败。

---

# 附录：che-writeback → che-retro 改名计划

日期：2026-10-30
状态：已执行完毕（2026-10-30 落地）

验证记录：`writeback` / `che-writeback` 在 skills/、packages/cli/src、tests/、README、AGENTS 零残留；唯一例外 `docs/che-compound-specify-simplification-plan.md` 按计划不动。

## 已确认决策

- `che-writeback` 技能改名 `che-retro`，命令引用、CLI state 阶段名同步改。
- **所有 `writeback` 字面量一律改为 `retro`**（与 specify 改名的"涉及即改"口径一致）：含描述性用法（如「writeback shape」「at writeback time」「交付后回写（writeback）」）。
- 中文普通动词「回写 / write back」无 `writeback` 字面的不改（如 README「新经验写回 store」）。
- 唯一例外：`docs/che-compound-specify-simplification-plan.md` 中的 writeback 提及属历史决策记录，**不动**（与 specify 改名对历史文档的处置一致）。

## 阶段 R1：技能本体

| 改动 | 位置 |
|---|---|
| 目录 `skills/che-writeback/` → `skills/che-retro/`（git mv） | — |
| frontmatter `name:`；description 中触发语「writeback 本次经验」→「retro 本次经验」 | `SKILL.md` L2/L3 |
| 正文**全部** `writeback` 字面量（L19「before writeback」、L23「writeback candidates」、L25 及 Handoff、Done When 各处） | 执行时以 grep 全量清单逐处替换，不遗漏 |

## 阶段 R2：技能间引用（`/che-writeback` → `/che-retro` 及描述性 writeback → retro）

- che-intentverify L165（PASS 提示语）、L244（报告模板）、L284-286（Handoff 目标/条件/回退）
- che-load L30（scaffold 提示语）、L99（禁忌清单）；`references/compound-store-README.md` L5/L24（「writeback shape」）/L36/L48（「at writeback (time)」）/L60；`references/ref.md` L123/L139/L170/L258
- che-adr-context L53；che-adr-draft L65-66；`che-adr-draft/scripts/scaffold.sh` L10（「compound writeback」→「compound retro」）
- che-grill-with-docs L66/L124（「compound writeback」→「compound retro」）

## 阶段 R3：CLI 源码

| 文件 | 改动 |
|---|---|
| `packages/cli/src/state.ts` | L29 注释、L51 STAGES 常量 `'writeback'` → `'retro'` |

说明：当前无任何技能调用 `che state start/done writeback`（只有 che-specify 用 state 命令），改名无运行时调用方要同步；测试未硬编码 writeback 阶段，无测试改动。

## 阶段 R4：仓级文档

- `AGENTS.md` L13（目录清单 `writeback` → `retro`）
- `docs/AI Native实践指南.md` L234（流程步骤 8）
- `README.md` L5「交付后回写（writeback）」→「（retro）」

## 验证

1. `npm test` 三脚本全绿。
2. 收尾 grep：`writeback` / `che-writeback` 全仓零残留，唯一例外是 `docs/che-compound-specify-simplification-plan.md`。

## 已知风险

- 无 CLI 硬编码路径、无 hook 键、无测试断言，风险低于 specify 改名；唯一耦合点是 intentverify Handoff（PASS 后推荐 `/che-writeback`）必须与技能改名同提交落地，否则交接指向不存在的命令。
- compound-store-README 中「writeback shape」「at writeback time」等描述性短语改 retro 后英文行文略生硬（「retro shape」），按"涉及即改"口径执行，不再单独保留。

---

# 附录二：che-intentverify 改名计划（目标名待定）

日期：2026-10-30
状态：待执行（目标名未填、决策未完成，暂不动工）

现状备注（2026-10-30 术语统一时补充）：che-writeback 已改名 che-retro，文中消费方即 che-retro；description 的「intent + spec 场景」冗余清理已先行落地为「锁定 intent + intent.md 场景」。执行本附录前先补目标名并重 grep 定位行号。

## 已确认决策

- `che-intentverify` 技能改名 `che-intentverify`，所有 `intentverify` 字面量一律改为 `intentverify`（"涉及即改"口径，与 specify / writeback 改名一致）。
- 产物文件契约一并改：`{TASK_DIR}/intentverify.md` → `intentverify.md`，`intentverify.briefing.md` → `intentverify.briefing.md`，`intentverify.checker.txt` / `.checker.log` → `intentverify.checker.*`。
- 唯一消费方 che-writeback（读 `{task_dir}/intentverify.md` 取 verdict）必须与技能改名**同提交**落地。
- 历史/方案文档不动：`docs/che-compound-specify-simplification-plan.md`、`docs/che-adr-check-planverify-fusion-plan.md`。

## 与 intend 改名的交互（执行顺序与口径）

1. **顺序：先 intend，后 intentverify**。specify 改名动的是最深的工件契约（spec.md、CLI 路径、hook 键、测试），intentverify 计划的行号基于 intend **未落地**的当前 main；intend 落地后，本计划所有行号以 grep 重新定位，且文中所有 `che-specify` / `/che-specify` 引用届时已是 `che-intend` / `/che-intend`。
2. **语义冗余清理**：intentverify description 现为「锁定 intent + spec 场景」；两次改名叠加后会读作「锁定 intent + intent.md 场景」——执行 intentverify 时把这类冗余措辞合并（如「锁定意图 + intent.md 场景」），不只做字面替换。
3. **命名对称**：改名后校验链为 `che-planverify`（plan 前）/ `che-intentverify`（实现后），verify 对仗，description 与 che-planverify 的互引措辞（「the cheaper, earlier mirror of intentverify」）同步改。

## 阶段 G1：技能本体

| 改动 | 位置 |
|---|---|
| 目录 `skills/che-intentverify/` → `skills/che-intentverify/`（git mv） | — |
| frontmatter `name:`；description 触发语「intentverify 校验本次实现」→「intentverify 校验本次实现」 | `SKILL.md` L2/L3 |
| 产物契约四处：`intentverify.md` / `.briefing.md` / `.checker.txt` / `.checker.log` | L63-65、L108、L128-142、L161、L197、L263 |
| 措辞：「Intent verify verdict is BLOCKED」、BLOCKED 回退提示等 | L19（writeback 侧同改）、L167、L286 |
| 「intent + spec 场景」类冗余措辞（叠加 intend 改名后） | L3 及 briefing 内容定义 L110-111 |

## 阶段 G2：技能间引用

- che-writeback L3/L10/L18-19/L150（含 `intentverify.md` 产物读取路径，**同提交**）
- che-implement L165（Handoff 目标）
- che-gapfill L115/L120/L148
- che-load L68；`references/compound-store-README.md` L58/L64；`references/ref.md` L72/L123/L165/L168/L189-192/L260
- che-planverify L11/L19/L52/L152（概念互引，含「mirror of intentverify」）
- che-project-init L54/L141（checker 策略配置注释）
- che-specify L18/L127（intend 落地后为 che-intend，引用同步）

## 阶段 G3：CLI 源码

| 文件 | 改动 |
|---|---|
| `packages/cli/src/state.ts` | L29 注释、L50 STAGES 常量 `'intentverify'` → `'intentverify'` |

说明：当前无任何技能调用 `che state start/done intentverify`；测试未硬编码该阶段；CLI 无 intentverify.md 硬编码路径（planverify-gate 只消费 planverify 报告）。

## 阶段 G4：仓级文档

- `AGENTS.md` L13（目录清单）
- `README.md` L6（Intent Driven Development 段）、L123（checker 策略说明）
- `docs/AI Native实践指南.md` L232（流程步骤 6）

## 验证

1. `npm test` 三脚本全绿。
2. 收尾 grep：`intentverify` 全仓零残留，例外仅为两个历史/方案文档；产物名 grep `intentverify.md|intentverify.briefing|intentverify.checker` 零残留。

## 已知风险

- 产物文件改名是消费者可见契约：che-writeback 读 `intentverify.md`、用户可能手动查看 briefing/checker 留档——同提交改齐，并在提交说明中点出产物更名。
- 无 state 调用方、无测试断言，机制风险低；主要工作量在技能间概念性互引（planverify/ref.md 等"为什么这样设计"的背景叙述）逐处改写。
