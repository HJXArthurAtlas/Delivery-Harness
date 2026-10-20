# init 模式：全新初始化

把模板仓的标准 monorepo 框架初始化进当前项目。**本文件是初始化流程的唯一载体**（模板仓 README 不再保存一键开始提示词）：命令与版本钉子以本文件为准，不凭记忆执行；版本变更时与模板仓 `AGENTS-TEMPLATE.md`「环境检查」巡检表两处同改（那边是巡检基线，这边是初始化基线）。

## 前提

- 网络可达 `git.newchiwan.com` 与 `github.com`。
- 当前目录是用户项目根（无骨架状态；不确定就先回 SKILL.md 做模式判定）。

## 流程（重启前）

1. **克隆模板仓到临时目录**：
   ```bash
   git clone https://git.newchiwan.com/council/monorepo-template.git /tmp/monorepo-template-$$
   ```
2. **复制骨架进当前项目根**：`AGENTS-TEMPLATE.md`、`.agents/`、`docs/adr/`、`scripts/`、`services/`、`apps/`、`Makefile`、`.gitignore`。
   - `AGENTS-TEMPLATE.md` 复制后改名 `AGENTS.md`；**不复制模板仓的 `README.md`**。
   - 空目录（`services/`、`apps/`、`docs/adr/` 等）补 `.gitkeep`。
   - **同名文件不覆盖**：目标已存在的跳过并记录，最后列出来问用户。
3. **环境就绪（缺了才装）**：Node.js ≥ 22 用本机包管理器装 LTS 或从 nodejs.org 装；uv 在 macOS/Linux 跑 `curl -LsSf https://astral.sh/uv/install.sh | sh`，Windows 跑 `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`。
4. **装 specify CLI**：`uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.1.3 --force`。
5. 项目根目录跑 `specify init --here --force --non-interactive --integration codex --ignore-agent-tools`，产出共享 skills：`.agents/skills/speckit-*/SKILL.md`。
6. **接入五个扩展**（项目根目录执行，全部自动以共享 skill 形态落 `.agents/skills/`，不产生宿主私有目录；确认提示用 `printf 'y\n' |` 应答）：
   - adrkit：`npm i -g @adrkit/cli@0.20.0`，然后 `printf 'y\n' | specify extension add adrkit --from https://github.com/mbeacom/adrkit/releases/download/spec-kit-v0.1.5/adrkit.zip`
   - pingcode：`npm i -g @metaphorli/pingcode-cli@latest`，然后 `printf 'y\n' | specify extension add pingcode --from https://github.com/HJXArthurAtlas/Spec-Kit-PingCode/releases/download/v2.9.0/pingcode-2.9.0.zip`
   - grill：`printf 'y\n' | specify extension add grill --from https://github.com/yoshi1220/speckit-grill-me/releases/download/v1.0.1/speckit-grill-me-extension-v1.0.1.zip`
   - bug（内置）：`specify extension add bug`
   - assess（内置）：`specify extension add assess`
7. **同步 pack 技能进项目**：`node <本 skill 目录>/scripts/sync.mjs`——把 `ncw-monorepo-init`、`ncw-speckit-flow` 装入项目 `.agents/skills/`（源与目标重合时脚本自动跳过，同名不覆盖）。
8. **接入 codegraph**：`npm i -g @colbymchenry/codegraph@1.6.2`；只为当前宿主写项目级 MCP 配置，不要为其他检测到的 agent 写宿主私有目录：宿主在其支持列表内用 `codegraph install -l local -t <宿主id> -y`，不在就手写 `.mcp.json`：`{"mcpServers":{"codegraph":{"type":"stdio","command":"codegraph","args":["serve","--mcp"]}}}`；再 `codegraph init` 建索引（`.codegraph/` 不提交，新 MCP 工具重启后才生效）。
9. **接入 AOCI-CODE**：从 releases 下载对应系统/架构的最新包，校验解压后把 `aoci`（Windows 为 `aoci.exe`）放进 PATH 下的稳定路径，确保 `aoci` 命令直接可用；用 aoci 跑 `init --agent <当前宿主>`（claude / codex / cursor / opencode / qoder；不支持就手写 MCP 条目 `{"mcpServers":{"aoci":{"type":"stdio","command":"aoci","args":["mcp"]}}}`，写不了就把配置内容报告给用户）；MCP 范围同第 8 条；再跑 `scan`；`aoci.txt` / `aoci.meta.txt` / `aoci.code.txt` / `AGENTS.md` 是认知资产，别加进 `.gitignore`。
10. **收尾**：删除 init 产生的 `*.backup.*`，按项目 `AGENTS.md` 的提交规范提交本次变更（含认知资产），然后停下提示用户重启 Agent。

全程**不新建业务代码、不改写骨架文件内容**（安全边界见 SKILL.md；需要定制的是用户项目自己的登记信息，不是骨架正文）。

## 重启后（第二段）

用户重启回来后依次执行：

1. 确认 codegraph MCP 与 AOCI MCP 均已接入，并用 codegraph 实际执行一次查询验证索引可用。
2. 通读根目录 `AGENTS.md` 并严格遵循，把项目信息登记进「布局」章节。
3. 为项目建立 AOCI 索引，完成后给出 AOCI 面板链接。
4. 按 `AGENTS.md` 的提交规范把本次变更（含 AOCI 认知索引）提交。

## 完成标志

- 项目根有完整骨架（清单见 `checklist.md` 第 1 节）。
- `specify extension list` 含 adrkit / pingcode / grill / bug / assess。
- `git log` 有本次初始化提交。
- 重启段完成后：`codegraph status` 已初始化、根目录有 `aoci.txt`、AGENTS.md 布局章节已登记。
