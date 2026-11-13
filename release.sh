#!/usr/bin/env bash
# release.sh — @arthuratlas/che CLI 发版入口：版本回写、最新性检查、推送 npm。
#
# 发布目标是 npm registry（可用 CHE_PUBLISH_REGISTRY 覆盖）；npm 认证读用户级
# ~/.npmrc，本脚本不含凭据。bun 打包与 tarball 暂存在 packages/cli/scripts/publish.sh，
# 本脚本只做它之外的版本事实管理。
#
# 用法：
#   bash release.sh                # 发布 packages/cli/package.json 当前版本（发布前自动查 npm 最新版）
#   bash release.sh 0.5.0          # 先把 0.5.0 写入 packages/cli/package.json + src/version.ts 再发布
#   bash release.sh --check        # 只检查 package.json 版本是否比 npm 已发布最新版新，不发布
#   bash release.sh 0.5.0 --check  # 以传入版本做检查，不回写、不发布
#
# 退出码：0 成功/可发布；1 版本不比线上新或发布失败；2 用法错误或无法读取 npm。
set -euo pipefail
cd "$(dirname "$0")"

REGISTRY="${CHE_PUBLISH_REGISTRY:-https://registry.npmjs.org/}"
PKG_DIR="packages/cli"
PKG_JSON="$PKG_DIR/package.json"
VERSION_TS="$PKG_DIR/src/version.ts"

usage() {
  cat <<'EOF'
用法: bash release.sh [版本号] [--check]
  bash release.sh                发布 packages/cli/package.json 当前版本（发布前自动查 npm 最新版）
  bash release.sh 0.5.0          把 0.5.0 写入 packages/cli/package.json + src/version.ts 再发布
  bash release.sh --check        只检查 package.json 版本是否比 npm 已发布最新版新，不发布
  bash release.sh 0.5.0 --check  以传入版本做检查，不回写、不发布
退出码: 0 成功/可发布; 1 版本不比线上新或发布失败; 2 用法错误或无法读取 npm
EOF
}

die() { echo "release.sh: $*" >&2; exit "${2:-1}"; }

valid_semver() { printf '%s' "$1" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$'; }

# semver 比较与求最大值共用：key 展开为 [major, minor, patch, is-release, prerelease 标识数组]，
# cmp 逐位比较（数组位先比长度语义：缺标识者小）。只在本脚本内使用。
semver_cmp_js='
const key = x => {
  const [core, pre] = x.split("-");
  const c = core.split(".").map(n => +n || 0);
  return [c[0], c[1], c[2], pre === undefined ? 1 : 0, pre ? pre.split(".") : []];
};
const cmp = (a, b) => {
  for (let i = 0; i < 5; i++) {
    const x = a[i], y = b[i];
    if (Array.isArray(x) || Array.isArray(y)) {
      const ax = Array.isArray(x) ? x : [], ay = Array.isArray(y) ? y : [];
      for (let j = 0; j < Math.max(ax.length, ay.length); j++) {
        const p = ax[j], q = ay[j];
        if (p === undefined) return -1;
        if (q === undefined) return 1;
        if (p !== q) return p < q ? -1 : 1;
      }
      return 0;
    }
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
};
'

# 解析参数
check_only=0
version=""
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    -c|--check) check_only=1 ;;
    -*) usage >&2; die "未知参数 $1" 2 ;;
    *) [ -z "$version" ] || die "版本号只能传一个（已有 $version，又来 $1）" 2
       version="$1" ;;
  esac
  shift
done

# 显式传版本：先校验；要发布时回写 package.json + version.ts（test-che-cli.sh 强制两者一致）
if [ -n "$version" ]; then
  valid_semver "$version" || die "非法版本号 '$version'，需要 X.Y.Z 或 X.Y.Z-prerelease" 2
  if [ "$check_only" -ne 1 ]; then
  node -e '
    const fs = require("node:fs");
    const [v, pkgPath, tsPath] = process.argv.slice(1);
    const pkg = fs.readFileSync(pkgPath, "utf8");
    const m = /"version"\s*:\s*"[^"]*"/.exec(pkg);
    if (!m) { console.error("package.json: 未找到 version 字段"); process.exit(1); }
    fs.writeFileSync(pkgPath, pkg.replace(m[0], "\x22version\x22: \x22" + v + "\x22"));
    const ts = fs.readFileSync(tsPath, "utf8");
    const decl = /export const CLI_VERSION = .+?;/.exec(ts);
    if (!decl) { console.error("version.ts: 未找到 CLI_VERSION 声明"); process.exit(1); }
    fs.writeFileSync(tsPath, ts.replace(decl[0], "export const CLI_VERSION = \x27" + v + "\x27;"));
  ' "$version" "$PKG_JSON" "$VERSION_TS"
  echo "==> 已回写 $version → $PKG_JSON + $VERSION_TS"
  fi
fi

local_version="$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).version' "$PKG_JSON")"
valid_semver "$local_version" || die "$PKG_JSON 版本非法: $local_version" 2
echo "==> 本地版本 ($PKG_JSON): $local_version"

# npm 上已发布的最新版（versions 全列表取 semver 最大，不依赖 dist-tags）
# E404 = 包未发布过（视为首次发布，可发布）；其余失败 = 网络或权限问题
npm_rc=0
npm_out="$(npm view @arthuratlas/che versions --json --registry="$REGISTRY" 2>/dev/null)" || npm_rc=$?
case "$npm_out" in *E404*) npm_rc=0;; esac
latest="$(printf '%s' "$npm_out" | node -e "$semver_cmp_js
let raw = '';
process.stdin.on('data', d => raw += d);
process.stdin.on('end', () => {
  let out = '';
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || !arr.every(x => typeof x === 'string')) {
      process.stdout.write('');
      return;
    }
    const max = arr.reduce((m, x) => m === null || cmp(key(x), key(m)) > 0 ? x : m, null);
    if (max) out = max;
  } catch {}
  process.stdout.write(out);
});")"

if [ -z "$latest" ]; then
  if [ "$npm_rc" -ne 0 ]; then
    if [ "$check_only" -eq 1 ]; then
      die "无法读取 npm 已发布版本（网络不通或无读权限；registry: $REGISTRY）" 2
    fi
    echo "==> 警告: 无法读取 npm 已发布版本，跳过最新性检查（重复版本会被 registry 拦下）"
  else
    if [ "$check_only" -eq 1 ]; then
      echo "==> npm 上暂无已发布版本，$local_version 可作为首次发布"
      exit 0
    fi
    echo "==> npm 上暂无已发布版本，首次发布 $local_version"
  fi
else
  echo "==> npm 最新已发布: $latest"
  if node -e "$semver_cmp_js
process.exit(cmp(key(process.argv[1]), key(process.argv[2])) > 0 ? 0 : 1)" \
       "$local_version" "$latest"; then
    echo "==> $local_version > $latest，可发布"
  elif [ "$check_only" -eq 1 ]; then
    die "$local_version 未比 npm 最新版 ($latest) 新" 1
  else
    die "$local_version 已在 npm（最新已发布 $latest）——先升版本: bash release.sh X.Y.Z" 1
  fi
fi

[ "$check_only" -eq 1 ] && exit 0

command -v bun >/dev/null 2>&1 || die "发布需要 bun 打包（见 packages/cli/scripts/publish.sh），本机未找到 bun"
echo "==> 发布 @arthuratlas/che@$local_version → $REGISTRY"
CHE_PUBLISH_REGISTRY="$REGISTRY" bash "$PKG_DIR/scripts/publish.sh"
echo "==> 完成: @arthuratlas/che@$local_version 已发布"
