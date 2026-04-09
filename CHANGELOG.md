# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다.

## [Unreleased]

### 추가
- 프로젝트 문서 정비 (README, CONTRIBUTING, DEVELOPMENT, ARCHITECTURE, API, CHANGELOG)

---

## [0.4.0] — 2026-04-09

### 하네스 에이전트 고도화

#### 추가
- PM agent 신규 — Plane 이슈 분해, 스프린트 관리, 진행 보고
- refactor agent 신규 — `isolation: worktree`로 격리 리팩토링
- `/pm`, `/pm-status` 스킬 — PM 관리 진입점
- `/brainstorm` 스킬 — 구현 전 기획 검증 (10개 이상 질문)
- `/harness-review` 스킬 — 하네스 구성 점검 및 메모리 분석
- `/refactor` 스킬 — 격리 리팩토링 진입점
- PreToolUse hook — 위험 명령 차단 (rm -rf, force push, DROP TABLE)
- SubagentStop hook — 에이전트 완료 시 lint/typecheck 검증
- Plane MCP 서버 연동 (`.mcp.json`)
- agent-memory 디렉토리 초기화 (7개 에이전트)

#### 변경
- 모든 에이전트 description → 영어 + 트리거 키워드 (라우팅 정확도 향상)
- 모든 에이전트 `memory: project` 추가 (세션 간 학습)
- 모든 에이전트 `tools` 최소 권한 적용
- 모든 에이전트 `maxTurns` 설정 (비용 제어)
- CLAUDE.md 토큰 최적화 (~47% 절감)
- org-chart.md 중복 제거

#### 조사
- 하네스 에이전트 종합 조사 보고서
- 테디노트 "Agent Harness" 발표 정리
- 하네스 에이전트 구성 가이드 (AS-IS/TO-BE)
- PM agent 배경 조사 및 설계 계획

---

## [0.3.0] — 2026-04-08

### 하네스 확장

- research 에이전트 추가 — 기술 조사/문서화 역할
- Laravel 규칙 라이브러리 및 `/rules` 스킬
- 에이전트/스킬 디렉토리 구조 통일 (SKILL.md)
- 디자인 스킬 파일명 SKILL.md로 통일

### 테스트

- Playwright E2E 테스트 53개 시나리오
- 시나리오별 QA 테스트 케이스 78개

---

## [0.2.0] — 2026-04-07

### 피벗 — Harness Engineering Platform

#### 추가
- FORGE-55: 홈 대시보드 재설계
- FORGE-57: HarnessWizard 5단계 (Profile → Work Types → Pattern → 6축 → Review)
- FORGE-58: 패턴 프리셋 → Canvas 자동 배치
- FORGE-59: HarnessRecommendationService — 체인 추천
- FORGE-60: 추가 Node 5종 (Hook, MCP, Memory, Permission, Settings)
- FORGE-61: 추가 Edge 3종 (Trigger, Reference, Load)
- FORGE-62: 패턴 상세 페이지 (/patterns/:id)
- FORGE-63: PropertyPanel 가이드 폼 개편
- FORGE-65: 학습 가이드 페이지 (/learn)
- FORGE-66: .claude/ 업로드 → 분석 플로우
- FORGE-67: GitHub URL 임포트
- FORGE-68: 내보내기 리포트 (설계문서 + 평가)
- FORGE-69: 도메인 특화 패턴 추가

#### 백엔드 API
- FORGE-48: PatternRegistry (7개 아키텍처 패턴)
- FORGE-49: HarnessEvaluationService — 6축 점수 산출
- FORGE-50: ContextBudgetCalculator — 토큰 예산
- FORGE-51: 신규 API 5개 (patterns, evaluate, context-budget, recommend, import)
- FORGE-52: 패턴 목록 페이지
- FORGE-53: 6축 평가 레이더 차트
- FORGE-54: Context Budget 바 차트

#### 인프라
- FORGE-43: CLAUDE.md 재작성
- FORGE-44: PRD 업데이트
- FORGE-45: 기존 Backlog 정리
- FORGE-46: 에이전트/스킬 description 업데이트

---

## [0.1.0] — 2026-04-05

### MVP — Claude Config Builder

- FORGE-6: Docker Compose + Makefile 인프라
- FORGE-7: Laravel 13 백엔드 스캐폴딩
- FORGE-8: React 19 + Vite + Tailwind 프론트엔드 스캐폴딩
- FORGE-9: CD 배포 파이프라인
- FORGE-10~15: MVP 캔버스 빌더 (Agent, Skill, Rule 노드)
- FORGE-16~18: CLI 어댑터 + 추천 엔진 + 규칙 DB API
- FORGE-27: Impeccable 디자인 스킬
- FORGE-28: CI/CD 파이프라인
- FORGE-34~37: 프로젝트 설정 편집기 + 온보딩 위자드
