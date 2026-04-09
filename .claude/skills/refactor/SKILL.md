---
name: refactor
description: 격리된 worktree에서 안전하게 리팩토링을 수행한다. 대규모 구조 변경, 의존성 업그레이드 등 위험한 변경에 사용.
user-invocable: true
argument-hint: "[리팩토링 대상 및 내용]"
---

# Refactor — 격리 리팩토링

refactor 에이전트에 리팩토링 작업을 위임한다. 격리된 git worktree에서 실행되어 메인 브랜치에 영향을 주지 않는다.

## 인자

- `$ARGUMENTS`: 리팩토링 대상 및 내용 (필수)

## 실행 절차

1. `$ARGUMENTS`의 리팩토링 요청을 분석한다.

2. refactor 에이전트에 위임한다:
   - 리팩토링 내용: `$ARGUMENTS`
   - 격리 환경: worktree (자동 적용)

3. 에이전트 완료 후 결과를 보고한다:
   - 변경된 파일 목록
   - worktree 브랜치명
   - 검증 결과 (lint/typecheck/test)

4. 사용자가 변경 사항을 확인하고 메인 브랜치에 병합 여부를 결정한다.

## 사용 예시

```
/refactor 서비스 레이어를 Repository 패턴으로 전환
/refactor React Flow 노드 컴포넌트를 compound component 패턴으로 리팩토링
/refactor Laravel 13 업그레이드에 따른 deprecated API 교체
```
