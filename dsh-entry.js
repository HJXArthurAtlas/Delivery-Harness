/**
 * delivery-harness — DSH bundle 入口：把 pack 的 skills/ 挂成 DSH 一等 SkillProvider。
 *
 * 契约（dsh 0.2.x docs/subsystems/skills.md）：
 *   - apply() 同步注册 provider（inject ['skills'] → ctx.skills.registerProvider）；
 *   - list() 返回候选数组（完整发现的简写），get() 重读正文（注册表不缓存完整定义）；
 *   - 候选语义字段由注册表校验且非法即 fail-fast，因此先自校验
 *     （kebab 名称、非空 description）再产出，不合格文件告警跳过。
 *
 * 冲突策略：rank 250 —— 项目级发现（.dsh/skills=100、.agents/skills=200）按名覆盖本 pack，
 * 本 pack 压过用户级目录（user-dsh=400、user-agents=500）。frontmatter 仅消费
 * name/description（本仓结构测试保证 name 与目录名一致），其余键原样进 metadata。
 */
import { readdir, readFile, stat } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'delivery-harness-skills'

export const inject = ['skills']

const PROVIDER_LABEL = 'delivery-harness'
const SOURCE = 'bundled'
const RANK = 250

/** 包内 skills/ 目录：随 bundle 安装落位（git 安装 = 仓根，npm 安装 = files 声明的 skills）。 */
const SKILLS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), 'skills')

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

/** 扁平 YAML 子集解析（`key: value`、引号包裹、布尔、缩进折行的纯标量续行），
 *  与 dsh 原生 provider（js-yaml）对 pack 内 frontmatter 的接受面一致。 */
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw)
  if (!match) return undefined
  const data = {}
  let lastKey
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    if ((line[0] === ' ' || line[0] === '\t') && lastKey !== undefined) {
      // 折行纯标量续行：折进前一个键（空值键先降级为空串）
      data[lastKey] = (typeof data[lastKey] === 'string' ? data[lastKey] : '') + ` ${trimmed}`
      continue
    }
    const idx = trimmed.indexOf(':')
    if (idx <= 0) return undefined
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if (value === '') {
      data[key] = true
    } else if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      data[key] = value.slice(1, -1)
    } else if (value === 'true') {
      data[key] = true
    } else if (value === 'false') {
      data[key] = false
    } else {
      data[key] = value
    }
    lastKey = key
  }
  return { data, content: raw.slice(match[0].length) }
}

function stringField(data, key) {
  const value = data[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

class PackSkillsProvider {
  constructor(ctx, control, config) {
    this.ctx = ctx
    this.control = control
    this.name = typeof config.providerName === 'string' ? config.providerName : PROVIDER_LABEL
    this.rank = typeof config.rank === 'number' ? config.rank : RANK
    this.root = SKILLS_ROOT
  }

  async list(options) {
    if (!(await isDirectory(this.root))) return []
    const candidates = []
    for (const entry of (await readdir(this.root, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      if (options?.signal?.aborted) return []
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue
      const skillPath = join(this.root, entry.name, 'SKILL.md')
      const parsed = await this.#load(skillPath)
      if (!parsed) continue
      candidates.push({ ...this.#summary(parsed, skillPath), rank: this.rank, locator: { path: skillPath } })
    }
    return candidates
  }

  async get(candidate, options) {
    if (candidate.provider !== this.name) return undefined
    const locator = candidate.locator
    if (!locator || typeof locator.path !== 'string') return undefined
    const parsed = await this.#load(locator.path)
    if (!parsed) return undefined
    return { ...this.#summary(parsed, locator.path), content: parsed.content }
  }

  async #load(path) {
    let raw
    try {
      raw = await readFile(path, 'utf-8')
    } catch {
      return undefined
    }
    let parsed
    try {
      parsed = parseFrontmatter(raw)
    } catch {
      parsed = undefined
    }
    if (!parsed) {
      this.ctx.logger.warn(`[delivery-harness] skill ${path} ignored: frontmatter 不可解析`)
      return undefined
    }
    const name = stringField(parsed.data, 'name') ?? basename(dirname(path))
    const description = stringField(parsed.data, 'description')
    if (!description || !KEBAB.test(name)) {
      this.ctx.logger.warn(
        `[delivery-harness] skill ${path} ignored: 需要 kebab-case name 与非空 description`,
      )
      return undefined
    }
    // 本仓 frontmatter 仅 name/description 两字段；预留额外键透传 metadata。
    const metadata = { ...parsed.data }
    delete metadata.name
    delete metadata.description
    return {
      name,
      description,
      invocation: { modelInvocable: true, userInvocable: true },
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      content: parsed.content,
    }
  }

  #summary(parsed, path) {
    return {
      path,
      name: parsed.name,
      description: parsed.description,
      invocation: parsed.invocation,
      source: SOURCE,
      provider: this.name,
      resourceBase: { kind: 'directory', path: dirname(path) },
      ...(parsed.metadata !== undefined ? { metadata: parsed.metadata } : {}),
    }
  }
}

export function apply(ctx, config = {}) {
  ctx.skills.registerProvider((control) => new PackSkillsProvider(ctx, control, config))
  ctx.logger.info(`[delivery-harness] pack skills root: ${SKILLS_ROOT}`)
}
