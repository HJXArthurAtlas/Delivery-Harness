---
schemaVersion: 0.2.0
id: "0007"
title: "数据库变更统一经 Liquibase 落地（幂等、追加式、无外键）"
status: accepted
date: 2026-10-13
deciders: [hongjianxiang@cmhk.com]
tags: [backend, liquibase, database, migration]
scope: domain
reversibility: one-way-door
blastRadius: team
relatesTo: []
affects:
  - type: path
    pattern: "services/**"
provenance:
  authoredBy: agent
  ratifiedBy: "liping05@cmhk.com"
review:
  decidedAt: 2026-10-19T02:44:42Z
---

# ADR-0007：数据库变更统一经 Liquibase 落地（幂等、追加式、无外键）

## 背景

后端（Spring Boot / MySQL，见 ADR-0001 行动项）需在 QA、PRD 多环境演进 schema 与数据。无统一机制时以下失败模式反复出现：

- 手工改库造成环境间 schema 漂移，下次部署 changeset 冲突；
- 编辑已 commit 的 changeset 导致各环境 `DATABASECHANGELOG` 校验和漂移、部署失败;
- 一次性 DML（历史数据迁移/修数）不走 changeset，重跑产生脏数据或漏跑无人知晓；
- 裸写 DDL 无存在性校验，目标环境重复执行直接打挂启动。

需要决定：数据库变更的唯一机制是什么，幂等与回退如何保证，已发布内容如何演进。本仓后端子项目尚未落地；首个模块开工前固化本规约，成本为零。

## 决策

1. **Liquibase 是唯一变更机制**：任何可自动执行的 DDL/DML——含建表、改列、索引、基础数据、业务回填、一次性历史数据迁移/修复——MUST 落为 formatted SQL changeset。执行点为 Spring Boot 启动时自动执行；master 只用显式 `include`。环境初始化手工脚本不注册 master，业务变更禁止写入。
2. **幂等靠 SQL 自身，不用 preconditions**：DDL 加 `IF [NOT] EXISTS` 等存在性校验；DML 用 `INSERT IGNORE` / `ON DUPLICATE KEY UPDATE` / 带明确 `WHERE` 的 UPDATE。
3. **已 commit 的内容不可变，修正一律追加**：纠错、口径推翻都只能在新 changeset 中表达；同一迭代文件内新 changeset 追加末尾，不插中间、不为分组挪动；新迭代文件追加 master 末尾。
4. **可回退变更必须写回退语句**：逻辑上允许恢复的 DML 与索引类 DDL 用 `--rollback` 标签写出恢复 SQL，回退语句同样幂等。
5. **不加外键**：关系完整性由应用层保证。
6. **迭代文件按上线封版**：迭代一经上线，其迭代文件即封版——不再追加、不再修改任何内容；MR 合入前必须核对目标迭代文件所属迭代尚未上线。上线后的遗漏一律在当前迭代文件追加新 changeset 修正（见决策 3）。

### 操作规约（NORMATIVE）

#### 执行机制与目录结构

- Liquibase 在 Spring Boot 启动时自动执行：无 `spring.liquibase.*` 自定义、无 Gradle 插件/任务，全部走默认（master 位于 `classpath:/db/changelog/db.changelog-master.yaml`）。
- 一个写错的 changeset 会直接打挂应用启动；DB 功能测试（Testcontainers）用同一 master 跑全量 changelog，任何 DB 测试都验证 changelog 正确性。

```text
src/main/resources/
  db/
    changelog/
      db.changelog-master.yaml    # 唯一入口，显式 include，不用通配符
      changesets/                 # DDL + DML + 修数 + 基础数据
        <迭代名>.sql              # 一个迭代一个文件，文件名即裸迭代名
  sql/
    base_data_qa.sql             # QA 环境手工初始化，不注册进 master
    base_data_prd.sql            # PRD 环境手工初始化，不注册进 master
```

- 基础数据、字典数据直接落迭代文件，不设独立的 `db/data/` 目录。

#### 第一步：确定迭代文件（强制流程）

同一个迭代下的所有 SQL（DDL、DML、修数、基础数据）收在一个以迭代名命名的文件 `db/changelog/changesets/<迭代名>.sql`。文件名就是裸迭代名，禁止日期、故事卡、主题等后缀（如 `sprint18_20260917_xxx.sql`），同一迭代禁止拆分多个文件。迭代名不允许猜测或编造：

1. 找到故事卡号：从用户需求、提交信息（`#<卡号>`）或分支名识别 PingCode 工作项号。
2. 查询该工作项所在迭代（iteration）名称（可用 pingcode skill）。
3. 规范化为文件名：全小写、去空格（`Sprint 16` → `sprint16.sql`）。
4. 兜底：查不到 → 明确告知用户并询问迭代名，不擅自决定；无故事卡的纯技术任务 → 询问归属迭代。

没有对应迭代文件就创建（并注册 master）；已存在就在文件末尾追加新 changeset，不另建文件、不再改 master。迭代内基础数据也放迭代文件。

追加前必须核对目标迭代文件所属迭代尚未上线（上线以发布记录/上线文档为准）。已上线迭代的文件即封版：不再追加、不再修改，变更一律改投当前（未上线）迭代文件；MR 因评审滞留跨越迭代切换的，评审时改投当前迭代文件并在 MR 描述中说明。

#### 迭代文件纠错（合并被误拆的迭代文件）

迭代文件被误拆成多个文件、或迭代数据误落其他目录时，纠错方向是合并回迭代文件，而不是认可拆分。合并 MUST 保持 Liquibase 变更身份（author:id:文件路径）不变，否则已执行过原文件的环境会把全部 changeset 判为未执行而重跑，裸 `ADD/DROP COLUMN` 类语句直接打挂启动：

1. 按原 master include 顺序把各文件的 changeset 原文搬进迭代文件：不改 SQL 正文、不改 author 与序号（checksum 不变）；
2. 被搬移的每条 changeset 在 `--changeset` 行追加 `logicalFilePath:db/changelog/changesets/<原文件名>.sql`，锁定执行身份，已执行环境不会重跑；
3. master 删去原文件 include、在末尾登记迭代文件，随后物理删除原文件；
4. 合并属规约纠错而非内容推翻，与铁律 1 不冲突；纠错 MR 描述列出原文件与目标文件的对照。

#### 第二步：书写 changeset

1. 文件头固定 `--liquibase formatted sql`。
2. `--changeset <author>:<序号>`：
   - author 一律用当前变更关联的 PingCode 故事卡 id，不用 `system` 等通用前缀；
   - 序号在每个 author 内从 1 递增（`<卡号>:1`、`<卡号>:2`…；换故事卡重新从 1 开始）；
   - 多故事卡共存一个迭代文件时按写入时间排序，新 changeset 一律追加文件末尾，不为分组挪动或插入中间；
   - 一个 changeset 只做一件事。
3. 每条 SQL 必须写 `-- comment:` 中文备注，第一段必须回答「为什么需要这样改」（哪个故事卡/业务诉求/历史问题驱动），让后人不看工单也能理解动机；随后补充对存量环境的影响与部署顺序注意事项。只有「做了什么」没有「为什么」视为不合格。
4. DDL 必须加存在性校验：MySQL 原生支持 `IF [NOT] EXISTS` 的语句必须加上（`CREATE TABLE IF NOT EXISTS`、`DROP TABLE IF EXISTS`、`CREATE VIEW ... OR REPLACE` 等），不允许裸写任何 DDL。
5. DML 幂等写法：`INSERT IGNORE`、`INSERT ... ON DUPLICATE KEY UPDATE`、带明确 `WHERE` 条件的 `UPDATE`（如限定 `tenant_id`）。
6. SQL 写法：表名/列名加反引号；新列带 `COMMENT`；INSERT 显式列出全部列名与语义化主键。
7. 可回退的 DML（INSERT→DELETE、UPDATE→反向 UPDATE、DELETE→重插）与索引类 DDL（`CREATE INDEX` / `ALTER TABLE ... ADD INDEX` → `DROP INDEX ... ON <表>`）必须写 `--rollback`：

   ```sql
   --changeset <故事卡号>:2
   -- comment: <故事卡号>:新增首页菜单
   INSERT IGNORE INTO `menus` (`id`, `app`, `name`) VALUES ('menu-home', 'PLATFORM', '首页');
   --rollback DELETE FROM `menus` WHERE id = 'menu-home';
   ```

8. DDL 与 JPA 实体保持一致：类型、长度、可空、默认值逐项对照。

#### DDL 约定

- 引擎/字符集：`ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`。
- 主键：应用生成的 `VARCHAR(32)` / `VARCHAR(64)` 为主，少量 `INT AUTO_INCREMENT`。
- 审计列：`created_at` / `updated_at`，`DEFAULT CURRENT_TIMESTAMP`，`updated_at` 带 `ON UPDATE CURRENT_TIMESTAMP`。
- 类型：金额/费率 `DECIMAL`（`DECIMAL(20,2)`、`DECIMAL(7,4)`）；布尔 `TINYINT(1)`；弹性结构 `JSON`。
- 索引命名：普通 `idx_{表}_{列或用途}`；唯一键 `uk_{用途}`。两种写法任选（`CREATE INDEX` 独立语句 / 与其他变更合并在一条 `ALTER TABLE`），必须带回退。
- 表名复数 snake_case，列名 snake_case；不加外键约束。

#### 第三步：注册 master（手动，不可漏）

新迭代文件在 master **末尾追加**：

```yaml
  - include:
      file: db/changelog/changesets/<迭代名>.sql
```

不插中间；include 路径与实际路径逐字符一致（写错启动即失败）。仅新文件首次创建时追加 include；往已注册文件追加 changeset 时 master 保持不变。

master 的结构完整性必须固化为无 Spring 依赖的纯解析单元测试自动门禁（随常规快速测试执行）：任意 mapping 无重复 key（严格 YAML 解析）、include 路径逐字符存在性、无重复注册三项检查，失败即指出具体行。人工核对降级为变更描述自查，不作为唯一防线——纯人工核验挡不住「语法合法、语义被静默改写」的 YAML 错误。

#### 铁律（任何情况不可违反）

1. **已 commit 的脚本内容禁止修改**：不论是否已在环境执行，推翻当前 SQL 逻辑也只能在同文件末尾追加新 changeset 修正（checksum 会校验失败）；确需修正历史 changeset 必须先与团队确认。
2. **迭代名必须来自故事卡实际查询结果**，查不到就问用户，禁止臆造。
3. **禁止绕过 Liquibase**：能自动执行的 DDL/DML（含一次性迁移/修复）必须落 changeset；唯一例外是无法自动化的操作，且需用户明确确认。
4. **已上线迭代文件封版**：上线迭代的文件禁止追加或修改任何内容，变更一律改投当前迭代文件；MR 合入前核对目标迭代尚未上线。

#### 例外情况

用户明确要求时可偏离，但需说明原因与风险：确实无法自动化的数据操作（人工逐条核对、依赖外部系统实时状态）走临时 data-fix 手工脚本（不进 master），可自动执行的部分仍必须落 changeset；用户指定其他目录结构或格式（XML/YAML changeset）。

## 备选方案

- **各环境手工脚本运维**：直接造成环境间 schema 漂移，无执行记录；拒绝。
- **Gradle 插件/按需执行替代启动自动执行**：多一个可遗忘的手工步骤；拒绝。
- **Liquibase `preconditions` 实现幂等**：条件逻辑游离于 SQL 之外，不可随 SQL 本身测试与审阅；拒绝。
- **`includeAll` 通配符注册**：执行顺序交给文件系统排序，不可审阅；拒绝。
- **引入外键**：制造第二套约束风格并限制后续在线 DDL，完整性防御收归应用层与测试；拒绝。

## 权衡

- 一条坏 changeset 即阻断应用启动，发布耦合度高。
- 无外键意味着应用层完整性缺陷不会被数据库拦截，只能靠应用逻辑与测试防御。
- 回退覆盖是部分的——不可逆 DDL（删列/删表）无法 rollback。

## 后果

- Easier: 全部变更单机制、单入口、单执行点，环境间可重复演进，无漂移。
- Easier: 写错的 changeset 直接打挂启动，DB 功能测试跑同一全量 changelog，错误暴露在部署/测试而非生产静默累积。
- Easier: 追加式演进让每个环境的执行历史可追溯，回退语句可实际执行。
- Harder: changeset 书写规约项多（author/序号/注释/幂等/rollback），靠静态核对清单与 review 拦截。
- **何以为错：** 环境间再次出现 schema 漂移、`DATABASECHANGELOG` 校验和冲突、或启动期 changeset 失败反复出现，即规约未被遵守或机制本身不足。
- Revisit if: 团队决定引入补偿型迁移框架（如事务性 schema 管理），或 MySQL 版本演进使 `IF [NOT] EXISTS` 覆盖面变化，届时修订幂等条款。

## 合规核对（静态进行，不靠启动验证）

读取本次涉及的文件逐项核对：

1. 新/改脚本：文件头存在；author 为故事卡 id、序号按 author 递增、一个 changeset 一件事；DDL 有存在性校验；DML 幂等；可回退项有 `--rollback`；`-- comment:` 第一段说清动因；往已有文件追加时未改动已有 changeset。
2. master：include 追加在末尾、路径逐字符一致、无重复注册——三项由 master 完整性自动门禁核验，本条降级为变更描述自查。
3. `changesets/` 目录：文件名为裸迭代名（无日期/故事卡/主题后缀）；同一迭代未拆多文件；目标迭代文件所属迭代未上线（封版核对）；纠错合并时被搬移 changeset 均带 `logicalFilePath` 且 SQL 正文未动。
4. DB 相关定点测试（自动跑全量 changelog）通过。

## 行动项

1. [ ] 评审：确认本仓后端技术栈为 Spring Boot + MySQL + 默认 Liquibase 集成（与 ADR-0001 行动项 1 联动）；确认 DDL 约定各默认值（字符集、主键策略、类型映射）。
2. [ ] 核对 affects 路径模式与目录结构（后端子项目落地时与实际布局对齐一次）。
3. [ ] 批准（status → accepted）或拒绝（status → rejected）；批准前本记录不约束任何实现。批准后将规则索引导入后端子项目 `AGENTS.md`（本记录是 Liquibase 变更的规范正文，无第二份需要同步的副本）。
