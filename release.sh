#!/usr/bin/env bash
# release.sh — @hjxarthuratlas/che CLI 版本事实管理：版本回写 + 与 npm 已发布版本比对。
#
# npm 发布不在本脚本：GitHub Release 创建后由 CI（.github/workflows/publish-cli.yml）
# 调用 packages/cli/scripts/publish.sh 完成。本脚本只做两件事：
#   1) 版本回写：<版本号> → packages/cli/package.json + src/version.ts（保持一致，测试强制）
#   2) --check：比对版本与 npm 已发布最新版（发版判定以退出码为准）
#
# 用法：
#   bash release.sh --check        # 检查 package.json 版本是否未上 npm（不回写、不发布）
#   bash release.sh 0.6.0          # 把 0.6.0 回写到 package.json + src/version.ts（不发布）
#   bash release.sh 0.6.0 --check  # 以传入版本做检查，不回写
#
# 退出码：0 版本未上 npm（待 CI 发布）；1 版本已在线上；2 用法错误或无法读取 npm。
set -euo pipefail
cd "$(dirname "$0")"

REGISTRY="${CHE_PUBLISH_REGISTRY:-https://registry.npmjs.org/}"
PKG_DIR="packages/cli"
PKG_JSON="$PKG_DIR/package.json"
VERSION_TS="$PKG_DIR/src/version.ts"

usage() {
  cat <<'EOF'
用法: bash release.sh [版本号] [--check]
  bash release.sh --check        检查 package.json 版本是否未上 npm（不回写、不发布）
  bash release.sh 0.6.0          把 0.6.0 回写到 packages/cli/package.json + src/version.ts（不发布）
  bash release.sh 0.6.0 --check  以传入版本做检查，不回写
退出码: 0 版本未上 npm; 1 版本已在线上; 2 用法错误或无法读取 npm
npm 发布由 GitHub Release 触发的 CI 完成（.github/workflows/publish-cli.yml）
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

# 显式传版本：先校验；非 --check 时回写 package.json + version.ts（test-che-cli.sh 强制两者一致）
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
  echo "==> 已回写 $version → $PKG_JSON + $VERSION_TS（发布由 CI 在 Release 创建后完成）"
  fi
fi

# 检查目标版本：显式传入优先（--check 不回写），否则取 package.json 当前值
if [ -n "$version" ]; then
  local_version="$version"
else
  local_version="$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).version' "$PKG_JSON")"
fi
valid_semver "$local_version" || die "版本非法: $local_version" 2
echo "==> 检查版本: $local_version"

# npm 上已发布的最新版（versions 全列表取 semver 最大，不依赖 dist-tags）
# E404 = 包未发布过（视为首次发布，rc=0 可发布）；其余失败 = 网络或权限问题
npm_rc=0
npm_out="$(npm view @hjxarthuratlas/che versions --json --registry="$REGISTRY" 2>/dev/null)" || npm_rc=$?
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
    die "无法读取 npm 已发布版本（网络不通或无读权限；registry: $REGISTRY）" 2
  fi
  echo "==> npm 上暂无已发布版本，$local_version 可作为首次发布（rc=0）"
else
  echo "==> npm 最新已发布: $latest"
  if node -e "$semver_cmp_js
process.exit(cmp(key(process.argv[1]), key(process.argv[2])) > 0 ? 0 : 1)" \
       "$local_version" "$latest"; then
    echo "==> $local_version 未上 npm（npm 最新 $latest），rc=0"
  else
    echo "==> $local_version 已在 npm（最新已发布 $latest）"
    exit 1
  fi
fi
