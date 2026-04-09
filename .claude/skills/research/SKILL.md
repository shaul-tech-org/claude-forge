---
name: research
description: 기술 조사 작업을 research 에이전트에 위임한다. 논문, 공식 문서, 오픈소스 비교, 웹 리서치 수행. 결과는 docs/research/에 문서화.
user-invocable: true
argument-hint: "조사 주제 (예: 'React Flow 상태 관리 라이브러리 비교', 'Laravel 13 신기능 분석')"
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
   - 조사 범위: 논문, 공식 문서, 유사 오픈소스 프로젝트, 웹 자료
   - 문서 저장 위치: `docs/research/{카테고리}/` (papers, official-docs, opensource, web)
   - 인덱스 갱신: 문서 작성 후 반드시 `docs/research/INDEX.md` 업데이트

3. 에이전트 작업 완료 후 결과를 요약하여 사용자에게 보고한다:
   - 핵심 발견사항 (3-5줄)
   - 권장 사항
   - 생성된 문서 파일 위치

## 사용 예시

```
/research React Flow 상태 관리 라이브러리 비교
/research Laravel 13 신기능 분석
/research Claude Code 하네스 설계 패턴 조사
```
