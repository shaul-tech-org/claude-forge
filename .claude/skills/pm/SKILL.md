---
name: pm
description: PM agent에게 프로젝트 관리 작업을 위임한다. 이슈 관리, 스프린트 계획, 진행 상황 확인, 블로커 분석 등.
user-invocable: true
argument-hint: "[작업 내용]"
---

# PM — 프로젝트 관리 위임

pm-agent에 프로젝트 관리 작업을 위임한다.

## 인자

- `$ARGUMENTS`: 작업 내용 (필수)

## 실행 절차

1. `$ARGUMENTS`의 작업 내용을 분석한다.

2. pm-agent에 아래 컨텍스트와 함께 위임한다:
   - 작업 내용: `$ARGUMENTS`
   - 프로젝트: claude-forge (FORGE)
   - Plane 설정: .env 파일 참조

3. 에이전트 작업 완료 후 결과를 사용자에게 보고한다.

## 사용 예시

```
/pm 현재 스프린트 상황 보고
/pm FORGE-42를 sub-issue로 분해해줘
/pm 다음 스프린트 계획 수립
/pm 블로커 이슈 분석
```
