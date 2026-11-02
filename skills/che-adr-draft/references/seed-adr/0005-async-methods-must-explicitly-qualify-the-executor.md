---
schemaVersion: 0.2.0
id: "0005"
title: "异步方法必须显式限定执行器（禁止裸 @Async）"
status: accepted
date: 2026-10-13
deciders: [hongjianxiang@cmhk.com]
tags: [backend, spring, async, concurrency, performance]
scope: domain
reversibility: two-way-door
blastRadius: team
relatesTo: ["0003", "0004"]
affects:
  - type: path
    pattern: "services/**"
provenance:
  authoredBy: agent
  ratifiedBy: "liping05@cmhk.com"
review:
  decidedAt: 2026-10-19T02:38:36Z
---

# ADR-0005：异步方法必须显式限定执行器（禁止裸 @Async）

## 背景

本决策适用于编写或 review `@Async` 异步方法（含 `@TransactionalEventListener`、`@EventListener` 订阅者）的场景。

Spring 对**裸 `@Async`**（无限定符）的解析在无 `AsyncConfigurer`、无名为 `taskExecutor` 的 bean 时回退到 `SimpleAsyncTaskExecutor`：每个任务新建一个线程、无线程数上界、无队列缓冲。风险是结构性的——峰值批量推送下每任务新建线程可耗尽线程与内存资源，且任务彼此争抢无反压；任何后续新增裸 `@Async` 的改动都会复发，需要边界规则而不是逐案例修补。

本仓后端子项目尚未落地（见 ADR-0001）；异步订阅者会随事件协作（ADR-0003）立刻出现，规则在开工前固化成本为零。

## 决策

- **新增/修改任何标注 `@Async` 的方法（含 `@TransactionalEventListener`、`@EventListener` 订阅者），必须显式指定执行器 bean**，如 `@Async("systemAsyncPool")`（有界池 + `CallerRunsPolicy` 反压）；工作负载不同类时选对应命名池（导出、批处理等各自独立），**禁止裸 `@Async`**。
- 后端落地时定义按工作负载命名的有界 `Executor` bean 集；不注册 `AsyncConfigurer` 或名为 `taskExecutor` 的默认 bean、不设 `@Primary`——默认兜底会把「没选池」掩盖成合规（见方案 B 拒绝理由）。
- **实现即遵守 + 双重执行点**：(a) implement 阶段——编码与任务拆分时本规则为设计前提，不得先写裸 `@Async` 再等 review 修正；(b) code-review 阶段——「裸 `@Async`」作为标准违规项拦截，是第二道防线而非唯一手段。
- **合规验证**：

```bash
# 应无输出：裸 @Async（无限定符）扫描
grep -rn "@Async$" services/*/src/main/java --include="*.java"
```

## 备选方案

### 方案 A：强制显式限定执行器（选定）

| Dimension | Assessment |
|---|---|
| 资源安全 | 全部异步任务落有界池，峰值有反压（CallerRunsPolicy），线程数可预测 |
| 可读性 | 执行器从注解直接可读，review 有机械检查点（grep 即验证） |
| 一致性 | 与命名池约定一致，不引入第二套风格 |

### 方案 B：注册默认 `taskExecutor` bean / `AsyncConfigurer`

**Pros:** 裸 `@Async` 也能落到有界默认池，不必逐处限定。
**Cons:** 执行器选择变成隐式约定——读代码看不出任务跑在哪个池，review 无法机械拦截；默认池一旦被误改（如换成虚拟线程池承载阻塞 IO），全仓裸 `@Async` 静默受影响。拒绝。

### 方案 C：Do nothing（不定规则）

**Pros:** 无规则成本。
**Cons:** 风险是结构性的，逐案例修补必然复发；问题以线程暴涨/OOM 形式在峰值下暴露，症状远离违规点。拒绝。

## 权衡

- 每个异步方法多写一个限定符，注解样板略增——代价可忽略，换来资源上界与可拦截性。
- 一刀切强制有界池：若未来出现适合虚拟线程的大批量阻塞 IO 场景，显式选对应池即可——本规则只禁止不选，不禁止按工作负载选池。

## 后果

- Easier: 异步执行器从注解即可读；峰值推送下线程资源可预测；review 有 grep 级机械拦截点。
- Harder: 新增异步方法时需在命名池中选择合适的一个（选择成本远低于隐式回退的排查成本）。
- **何以为错：** 生产日志出现 `SimpleAsyncTaskExecutor` 风格的线程暴涨 / OOM，或某链路因强制有界池排队成为瓶颈且无法通过显式选池解决——说明规则不足或过度。
- Revisit if: Spring 升级改变 `@Async` 默认解析行为，或团队决定收敛到显式默认池 + 例外限定（引入 `AsyncConfigurer`）。

## 行动项

1. [ ] 评审：确认后端落地时的命名有界执行器集（系统异步、导出、批处理等）与「无默认 `taskExecutor` / `AsyncConfigurer`」约定。
2. [ ] 核对 affects 路径模式（后端子项目落地时与实际布局对齐一次，对齐 ADR-0001 同类行动项）。
3. [ ] 批准（status → accepted）或拒绝（status → rejected）；批准前本记录不约束任何实现。批准后将规则索引导入后端子项目 `AGENTS.md`（规则本体保留在本记录，不设第二份副本）。
