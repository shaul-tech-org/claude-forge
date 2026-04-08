---
name: research
description: 기술 조사 작업을 research 에이전트에 위임한다. 새로운 기술/라이브러리/아키텍처 조사, 대안 비교, 기술 동향 분석 시 사용.
user_invocable: true
args: "조사 주제 (예: 'React Flow 상태 관리 라이브러리 비교', 'Laravel 13 신기능 분석')"
---

# 기술 조사 — Research Agent 위임

research 에이전트에 기술 조사 작업을 위임한다.

## 인자

- `$ARGUMENTS`: 조사 주제 (필수)

## 실행 절차

1. `$ARGUMENTS`의 조사 주제를 분석한다.

2. research 에이전트에 아래 컨텍스트와 함께 위임한다:
   - 조사 주제: `$ARGUMENTS`
   - 프로젝트 컨텍스트: claude-forge의 기술 스택 (PHP 8.4 + Laravel 13, React + TypeScript + React Flow + Tailwind CSS, PostgreSQL, Docker)
   - 지시: 조사 결과를 `docs/` 폴더에 구조화된 마크다운으로 저장

3. 에이전트 작업 완료 후 결과를 요약하여 사용자에게 보고한다:
   - 핵심 발견사항 (3-5줄)
   - 권장 사항
   - 보고서 파일 위치
