#!/usr/bin/env bash
# PingCode OAuth 登录包装（che-pingcode-init 技能自带，随技能包分发）。
# 封装 OAuth client 凭据，使其不落入消费项目文件；供本技能、
# /che-project-init 步骤 5 与项目 AGENTS.md 环境检查复用。
#
# 用法:
#   pingcode-login.sh status             只检查：退出码 0 = 已认证且 token 有效，1 = 否
#   pingcode-login.sh login [透传参数]   检查并在需要时登录；透传参数原样交给
#                                        `pingcode auth login`（如 --code <授权码>、--dry-run）
#   pingcode-login.sh                    同 login
#
# 登录会打开浏览器并阻塞等待授权回调（127.0.0.1:8765），挂起等待属正常；
# 请给足 ≥300 秒，不要因命令未退出而中止。命令退出即登录完成，无需轮询。
# 远程 SSH / 浏览器打不开：先 `login --dry-run` 打印授权 URL，用户在浏览器完成
# 授权后从重定向地址 `…/callback?code=…` 复制 code，改 `login --code <授权码>`。
set -euo pipefail

CLIENT_ID='ebNcnZiqHRcI'
CLIENT_SECRET='UFItoWENoUZuKgLpvufaMkcf'

# 认证判定：解析 auth status 的 JSON（authenticated 与 token_valid 均为 true 才算通过；
# CLI 缺失、输出非 JSON 一律按未认证处理）
is_authenticated() {
  { pingcode auth status 2>/dev/null || true; } | node -e '
    let s = "";
    process.stdin.on("data", (d) => (s += d));
    process.stdin.on("end", () => {
      try {
        const j = JSON.parse(s);
        process.exit(j.authenticated === true && j.token_valid === true ? 0 : 1);
      } catch {
        process.exit(1);
      }
    });
  '
}

require_cli() {
  command -v pingcode >/dev/null 2>&1 || {
    echo "pingcode: CLI 未安装（npm i -g @metaphorli/pingcode-cli@latest）" >&2
    exit 1
  }
}

cmd="${1:-login}"

case "$cmd" in
  status)
    require_cli
    if is_authenticated; then
      echo "pingcode: 已认证（authenticated: true, token_valid: true）"
    else
      echo "pingcode: 未认证或 token 失效" >&2
      exit 1
    fi
    ;;
  login)
    if [ "$#" -gt 0 ]; then shift; fi
    require_cli
    if is_authenticated; then
      echo "pingcode: 已认证，无需登录"
      exit 0
    fi
    echo "pingcode: 未认证，即将打开浏览器完成 PingCode 授权（阻塞等待回调属正常，请给足 ≥300 秒）…"
    pingcode auth login --client-id "$CLIENT_ID" --client-secret "$CLIENT_SECRET" "$@"
    if is_authenticated; then
      echo "pingcode: 登录成功"
    else
      echo "pingcode: 登录命令已结束但认证仍未通过；可重试，或改用授权码模式：login --dry-run 取 URL，再 login --code <授权码>" >&2
      exit 1
    fi
    ;;
  *)
    echo "用法: $0 [status | login [透传参数]]" >&2
    exit 2
    ;;
esac
