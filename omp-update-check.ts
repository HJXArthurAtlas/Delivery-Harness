// omp-update-check — marketplace 插件启动更新检查（omp 专属扩展）。
//
// 由根 package.json 的 `omp.extensions` 声明加载：omp marketplace 安装本插件后，
// 每次会话启动（session_start）对比「已装版本」（快照内 package.json#version）
// 与远端最新 vX.Y.Z tag，有新版则通过 ctx.ui.notify 提示升级命令——对标 omp
// 自身的 Update Available 横幅（形态为 TUI 通知）。
//
// 纪律：任何失败（无 git、网络不可达、解析失败、无 UI）一律静默返回，绝不阻塞
// 会话启动；远端查询结果缓存 24 小时（XDG_CACHE_HOME 优先），失败沿用旧缓存。

import { execFile } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const PACK_REPO = 'https://github.com/HJXArthurAtlas/Delivery-Harness.git';
const UPGRADE_CMD = 'omp plugin upgrade delivery-harness@delivery-harness';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const GIT_TIMEOUT_MS = 8000;
const RELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

interface NotifyUI {
  notify?: (message: string, level?: string) => void;
}
interface SessionCtx {
  ui?: NotifyUI;
  hasUI?: boolean;
}
interface PiLike {
  on(event: 'session_start', handler: (event: unknown, ctx: SessionCtx) => void | Promise<void>): void;
}

function cacheFile(): string {
  const base = process.env.XDG_CACHE_HOME && process.env.XDG_CACHE_HOME.trim() !== ''
    ? process.env.XDG_CACHE_HOME
    : join(homedir(), '.cache');
  return join(base, 'delivery-harness', 'omp-update-check.json');
}

interface CheckState {
  latest: string;
  checkedAt: number;
}

function readCache(): CheckState | null {
  try {
    const parsed = JSON.parse(readFileSync(cacheFile(), 'utf8')) as CheckState;
    if (typeof parsed.latest === 'string' && typeof parsed.checkedAt === 'number') return parsed;
  } catch {
    /* 缓存缺失或损坏都视为无缓存 */
  }
  return null;
}

function writeCache(state: CheckState): void {
  try {
    mkdirSync(dirname(cacheFile()), { recursive: true });
    writeFileSync(cacheFile(), JSON.stringify(state) + '\n');
  } catch {
    /* 缓存写失败只影响下次查询频率，不影响本次结果 */
  }
}

function compareVersions(a: string, b: string): number {
  const part = (value: string, index: number): number => {
    const chunk = value.replace(/^[^0-9.]+/, '').split('.')[index] ?? '0';
    return Number.parseInt(chunk, 10) || 0;
  };
  for (let i = 0; i < 3; i++) {
    const diff = part(a, i) - part(b, i);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** 快照内根 package.json#version 即已装版本（marketplace 安装是整仓快照）。 */
function installedVersion(): string | null {
  let dir = dirname(realpathSync(fileURLToPath(import.meta.url)));
  for (let i = 0; i < 8; i++) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath) && statSync(pkgPath).isFile()) {
      try {
        const version = JSON.parse(readFileSync(pkgPath, 'utf8')).version;
        if (typeof version === 'string' && version !== '') return version;
      } catch {
        /* 继续向上找 */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

async function fetchLatestTag(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('git', ['ls-remote', '--tags', PACK_REPO], {
      timeout: GIT_TIMEOUT_MS,
      encoding: 'utf8',
    });
    let best: [number, number, number] | null = null;
    let bestTag: string | null = null;
    for (const line of stdout.split('\n')) {
      const refname = line.split('\t')[1] ?? '';
      const match = /^refs\/tags\/(v\d+\.\d+\.\d+)$/.exec(refname);
      if (!match) continue;
      const parts = RELEASE_TAG.exec(match[1]);
      if (!parts) continue;
      const cur: [number, number, number] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
      if (best === null || cur > best) {
        best = cur;
        bestTag = match[1];
      }
    }
    return bestTag;
  } catch {
    return null;
  }
}

export default function ompUpdateCheck(pi: PiLike): void {
  pi.on('session_start', async (_event, ctx) => {
    try {
      if (ctx?.hasUI === false) return;
      const installed = installedVersion();
      if (installed === null) return;

      const cached = readCache();
      let latest = cached?.latest ?? null;
      if (cached === null || Date.now() - cached.checkedAt > CHECK_INTERVAL_MS) {
        const fetched = await fetchLatestTag();
        if (fetched !== null) {
          latest = fetched;
          writeCache({ latest: fetched, checkedAt: Date.now() });
        }
      }
      if (latest === null) return;
      if (compareVersions(latest, installed) > 0) {
        ctx?.ui?.notify?.(
          `Delivery Harness 新版本 ${latest} 可用（当前 ${installed}）。运行: ${UPGRADE_CMD}`,
          'info',
        );
      }
    } catch {
      /* 更新检查永远不阻塞会话 */
    }
  });
}
