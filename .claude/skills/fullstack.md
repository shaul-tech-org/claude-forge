---
name: fullstack
description: 복합(풀스택) 작업을 coordinator 에이전트를 통해 분해하고 순차 위임한다. 백엔드+프론트엔드 등 여러 영역에 걸친 작업 시 사용.
user_invocable: true
args: "작업 내용 (예: '새 기능 풀스택 구현: 프로젝트 설정 CRUD')"
---

# 풀스택 작업 — Coordinator 경유

여러 에이전트 영역에 걸친 복합 작업을 coordinator가 분해하여 순차 위임한다.

## 인자

- `$ARGUMENTS`: 작업 내용 (필수)

## 실행 절차

1. `$ARGUMENTS`의 작업 내용을 분석한다.

2. coordinator 에이전트에 아래 컨텍스트와 함께 위임한다:
   - 작업 내용: `$ARGUMENTS`
   - 현재 git 브랜치명
   - 지시: "이 작업을 세부 작업으로 분해하고, 의존 순서에 따라 적절한 에이전트에 순차 위임하라."

3. coordinator가 작업을 분해한다:
   - 백엔드 먼저 (API, DB) → be-developer
   - 프론트엔드 (UI, 연동) → fe-developer
   - 인프라 (필요 시) → infra-engineer

4. 모든 에이전트 작업 완료 후 coordinator가 통합 결과를 보고한다:
   - 각 에이전트별 작업 요약
   - 생성/수정된 전체 파일 목록
   - 통합 테스트 필요 여부 안내
