---
schemaVersion: 0.2.0
id: "0003"
title: "TransactionalEventListener 使用规则"
status: accepted
date: 2026-10-13
deciders: [hongjianxiang@cmhk.com]
tags: [backend, spring, events, testing]
scope: domain
reversibility: two-way-door
blastRadius: team
relatesTo: ["0001"]
affects:
  - type: path
    pattern: "services/**"
provenance:
  authoredBy: agent
  ratifiedBy: "liping05@cmhk.com"
review:
  decidedAt: 2026-10-19T02:34:58Z
---

# ADR-0003：TransactionalEventListener 使用规则

## 背景

本决策适用于编写或 review `@TransactionalEventListener` 事件监听器、处理 spring-framework 6.2 `RestrictedTransactionalEventListenerFactory` 约束、以及排查功能测试上下文启动失败的场景，目的是避免监听器注解组合导致整个 Spring 测试上下文构建失败。

spring-framework 6.2 起，`org.springframework.transaction.annotation.RestrictedTransactionalEventListenerFactory`（默认注册）禁止 `@TransactionalEventListener` 方法与「非 REQUIRES_NEW / NOT_SUPPORTED 传播级别」的 `@Transactional` 组合。违规在 Spring 上下文启动时抛 `IllegalStateException`，导致**整个 `@SpringBootTest` 上下文构建失败**，并经测试上下文缓存放大为所有共享该基类的功能测试全部失败（表象是 `DefaultCacheAwareContextLoaderDelegate` 的 `IllegalStateException`，易误判为基类/环境问题）。

本仓后端子项目尚未落地（见 ADR-0001）；跨 domain 协作固定走 `ApplicationEvent` + Subscriber，监听器数量会随首个模块立刻增长，规则在开工前固化成本为零。

## 决策

### 硬规则

- `@TransactionalEventListener` 方法**默认不要标注 `@Transactional`**：AFTER_COMMIT / AFTER_ROLLBACK 等阶段监听器已不在原事务内，单条写操作自带原子性；加事务既无效又会触发上述约束。
- 若监听器方法确需事务（如多条写操作需独立提交），标注 `@Transactional(propagation = Propagation.REQUIRES_NEW)`（或 `NOT_SUPPORTED`）。
- 唯一豁免：`phase = TransactionPhase.BEFORE_COMMIT` 的监听器可在原事务内正常用 `@Transactional`——`RestrictedTransactionalEventListenerFactory` 对 BEFORE_COMMIT 阶段不校验。

### 排查指南

功能测试批量报 `java.lang.IllegalStateException`（堆栈顶部 `DefaultCacheAwareContextLoaderDelegate`，更完整的堆栈含 `EventListenerMethodProcessor` → `RestrictedTransactionalEventListenerFactory`），先怀疑本规则，再逐一排查近期新增的 `@TransactionalEventListener` 类。

定位命令（找违规类）：

```bash
# 列出同时标注两种注解且未声明 REQUIRES_NEW / NOT_SUPPORTED 的类
grep -rl "@TransactionalEventListener" src/main --include=*.java \
  | xargs grep -l "@Transactional" \
  | xargs grep -L "REQUIRES_NEW\|NOT_SUPPORTED"
```

修复方式：删除多余的 `@Transactional`（首选，符合 ADR-0001「事务边界 ONLY 声明在 ApplicationService/Service」约定），或改传播级别为 `REQUIRES_NEW`。

## 备选方案

### 方案 A：默认不标 `@Transactional`，确需事务显式 `REQUIRES_NEW`（选定）

| Dimension | Assessment |
|---|---|
| 安全性 | 与 spring 6.2 约束兼容，上下文永不因注解组合启动失败 |
| 语义 | 阶段监听器本就在原事务外，注解与真实事务语义一致 |
| 代价 | 确需多条写独立提交时必须记得显式声明传播级别，靠 review 与定位命令兜底 |

### 方案 B：监听器统一强制 `@Transactional`

**Pros:** 写操作「看起来」有事务保护，规则单一。
**Cons:** AFTER_COMMIT 阶段的 `@Transactional` 是无效注解，假保护；直接违反 spring 6.2 默认约束，上下文启动即失败；与 ADR-0001「事务边界只在 ApplicationService/Service」冲突。

### 方案 C：Do nothing（不定规则）

首个监听器踩中约束时才以失败方式发现，且症状（全量功能测试批量失败）远离违规点本身，排查成本高。

## 权衡

- 收益：监听器注解组合永不触发 `RestrictedTransactionalEventListenerFactory`；事务注解与真实事务语义一致。
- 代价：`REQUIRES_NEW` 豁免依赖 review 纪律与定位命令；规则依据 spring-framework 6.2 行为，若后端固定在旧版本，「默认不标」仍成立但豁免条款退化为纯风格约定。

## 后果

- Easier: 新增监听器默认零事务注解，与 ADR-0001 事务边界约定自然对齐。
- Harder: review 需核对 AFTER_COMMIT / AFTER_ROLLBACK 监听器不带裸 `@Transactional`；`REQUIRES_NEW` 豁免需要理由。
- **何以为错：** 后端最终不采用 Spring 事件机制（跨域协作改走其他通道），或 spring-framework 回退该约束且团队更倾向显式事务风格——此时拒绝或改写本记录。
- Revisit if: spring-framework 变更 `RestrictedTransactionalEventListenerFactory` 的校验范围（如 BEFORE_COMMIT 也纳入校验）。
- 合规验证：用「排查指南」定位命令扫描违规类；review 核对阶段监听器不标注裸 `@Transactional`。

## 行动项

1. [ ] 评审：确认本仓后端 spring-framework 版本 ≥ 6.2（约束生效；旧版本下「默认不标」作为风格约定仍成立）。
2. [ ] 核对 affects 路径模式（后端子项目落地时与实际布局对齐一次，对齐 ADR-0001 同类行动项）。
3. [ ] 批准（status → accepted）或拒绝（status → rejected）；批准前本记录不约束任何实现。批准后将规则索引导入后端子项目 `AGENTS.md`（规则本体保留在本记录，不设第二份副本）。
