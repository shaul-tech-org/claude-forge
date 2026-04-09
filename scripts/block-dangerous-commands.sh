#!/bin/bash
# PreToolUse hook — 위험 명령 차단
# Exit code 2 = 차단 (permissionDecision: deny)
# Exit code 0 = 허용

COMMAND="$TOOL_INPUT"

# rm -rf / 또는 rm -rf ~ 등 치명적 삭제 차단
if echo "$COMMAND" | grep -qE 'rm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+|--force\s+)*(\/|~|\$HOME)'; then
  echo '{"decision": "deny", "reason": "시스템/홈 디렉토리 삭제 명령 차단"}'
  exit 2
fi

# git push --force to main/master 차단
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force.*\s+(main|master)'; then
  echo '{"decision": "deny", "reason": "main/master 브랜치 force push 차단"}'
  exit 2
fi

# git reset --hard 차단
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo '{"decision": "deny", "reason": "git reset --hard 차단 — 데이터 손실 위험"}'
  exit 2
fi

# DROP DATABASE / DROP TABLE 차단
if echo "$COMMAND" | grep -qiE '(DROP\s+(DATABASE|TABLE|SCHEMA))'; then
  echo '{"decision": "deny", "reason": "데이터베이스/테이블 삭제 명령 차단"}'
  exit 2
fi

exit 0
