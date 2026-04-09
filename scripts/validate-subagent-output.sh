#!/bin/bash
# SubagentStop hook — 에이전트 완료 시 기본 검증
# Exit code 0 = 통과, Exit code 2 = 차단

AGENT_NAME="$SUBAGENT_NAME"

case "$AGENT_NAME" in
  be-developer)
    # PHP lint 검증 (backend 디렉토리가 있을 때만)
    if [ -d "backend" ] && [ -f "backend/vendor/bin/pint" ]; then
      cd backend && ./vendor/bin/pint --test 2>&1 | tail -3
    fi
    ;;
  fe-developer)
    # TypeScript 타입 체크 (frontend 디렉토리가 있을 때만)
    if [ -d "frontend" ] && [ -f "frontend/tsconfig.json" ]; then
      cd frontend && npx tsc --noEmit 2>&1 | tail -5
    fi
    ;;
esac

# 항상 통과 (경고만 출력, 차단하지 않음)
exit 0
