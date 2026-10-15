# init 模式：全新初始化

把模板仓的标准 monorepo 框架初始化进当前项目。**执行正文是模板仓 README 的「一键开始」**——本文件只定义流程和判定点，不复制命令；命令与版本钉子以克隆出来的 README 当前内容为准，发现与本文件冲突时以模板仓为准，并提示用户更新 skill。

## 前提

- 网络可达 `git.newchiwan.com` 与 `github.com`。
- 当前目录是用户项目根（无骨架状态；不确定就先回 SKILL.md 做模式判定）。

## 流程

1. **克隆模板仓到临时目录**：
   ```bash
   git clone https://git.newchiwan.com/council/monorepo-template.git /tmp/monorepo-template-$$
   ```
2. **读克隆里的 `README.md` 的「一键开始」章节**，把它里面的步骤当作用户下达的指令逐条执行。执行时注意以下判定点（README 用提示词口吻写，这里是你在执行时的裁量边界）：
   - 骨架复制范围以 README 第 1 步清单为准；`AGENTS-TEMPLATE.md` 复制后改名 `AGENTS.md`；**不复制 README.md 本身**。
   - **同名文件不覆盖**：目标已存在的文件跳过并记录，最后列出来问用户。
   - 空目录（`services/`、`apps/`、`docs/adr/` 等）补 `.gitkeep`。
   - 环境就绪、spec-kit、五个扩展、codegraph、AOCI 的精确命令与版本号全部照抄 README 当前内容，**不凭记忆写版本**。
   - codegraph / AOCI 的 MCP 配置只为当前宿主写项目级配置，不为其他检测到的 agent 写目录。
   - 全程**不新建业务代码、不改写骨架文件内容**。
3. **收尾**：按 README 第 8 步删除 `*.backup.*`、按项目 `AGENTS.md` 的提交规范提交本次变更（含认知资产），然后停下，提示用户重启 Agent。
4. **重启后（第二段）**：用户重启回来后，执行 README「重启 Agent 之后」段落：确认 codegraph 与 AOCI 两个 MCP 已接入 → codegraph 实查一次验证索引 → 通读 `AGENTS.md` 并登记项目「布局」章节 → 建立 AOCI 索引、给出面板链接 → 按提交规范提交（含认知索引）。

## 完成标志

- 项目根有完整骨架（清单见 `checklist.md` 第 1 节）。
- `specify extension list` 含 adrkit / pingcode / grill / bug / assess。
- `git log` 有本次初始化提交。
- 重启段完成后：`codegraph status` 已初始化、根目录有 `aoci.txt`、AGENTS.md 布局章节已登记。
