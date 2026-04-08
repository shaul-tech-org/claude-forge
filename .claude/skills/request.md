---
name: request
description: Plane 이슈 기반 작업 요청. 이슈 번호를 받아 컨텍스트를 로드하고 Coordinator가 적절한 에이전트에 라우팅한다.
user_invocable: true
args: "FORGE-{번호} 형식의 이슈 번호"
---

# 이슈 기반 작업 요청

Plane 이슈를 기반으로 작업을 수행한다.

## 인자

- `$ARGUMENTS`: `FORGE-{번호}` (필수)

## 실행 절차

1. `/plane-start $ARGUMENTS`를 실행하여:
   - 이슈 상태를 In Progress로 변경
   - 작업 브랜치 생성
   - 이슈 상세 내용 로드

2. 이슈 내용을 분석하여 작업 유형을 판단한다:
   - **백엔드**: PHP, Laravel, API, DB, 마이그레이션 관련 → `be-developer` 에이전트
   - **프론트엔드**: React, TypeScript, UI, 컴포넌트 관련 → `fe-developer` 에이전트
   - **인프라**: Docker, CI/CD, 배포 관련 → `infra-engineer` 에이전트
   - **복합**: 여러 영역 → 순차적으로 분해하여 각 에이전트에 위임

3. 해당 에이전트에 아래 컨텍스트를 전달한다:
   - 이슈 제목 및 설명
   - 우선순위
   - sub-issue 목록 (있는 경우)
   - 작업 브랜치명

4. 에이전트 작업 완료 후 `/plane-done $ARGUMENTS`를 실행하여:
   - 커밋 요약 코멘트 추가
   - 이슈 상태를 Done으로 변경

## 주의사항

- 이슈에 sub-issue가 있으면, 각 sub-issue를 개별 작업 단위로 처리한다.
- 커밋 메시지는 반드시 `feat: FORGE-{번호} {설명}` 형식을 따른다.
- 작업 범위는 이슈에 명시된 내용만 수행한다.
