# claude-forge

> Harness Engineering Platform — AI 하네스를 설계하고 구축하고 평가하는 도구

## 제품 정의

claude-forge는 Claude Code 사용자가 자신의 작업 방식에 맞는 AI 하네스를
설계(Design), 구축(Build), 평가(Evaluate), 진화(Evolve)할 수 있는 웹 플랫폼이다.
이 프로젝트 자체가 claude-forge의 첫 번째 활용 사례(showcase)이다.

## 핵심 개념: 6축 프레임워크

1. **Context Engineering** — 모델에 전달되는 정보의 질과 양 (CLAUDE.md, Rules, Agent frontmatter)
2. **Verification Loops** — 출력물의 자동 검증 (Evaluator agent, Test runner)
3. **State Management** — 세션 간 학습과 기억 (Memory, agent-memory)
4. **Tool Orchestration** — 도구 호출의 최적 조합 (Agent tools[], Skills, MCP)
5. **Human-in-the-Loop** — 위험 결정의 사람 개입 (Permission modes, approval gates)
6. **Lifecycle Management** — 이벤트 기반 자동화 (Hooks, Settings)

## 기술 스택

| 항목 | 기술 |
|------|------|
| 백엔드 | PHP 8.4 + Laravel 13 |
| 프론트엔드 | TypeScript + React 19 + React Flow 12 + Tailwind CSS 4 |
| DB | PostgreSQL 18 |
| AI 엔진 | 로컬 Claude Code CLI |
| 인프라 | Docker Compose |

## 조직도

```
사용자
  └── Coordinator (sonnet) — 요청 분석 + 라우팅
        ├── be-developer (sonnet) — PHP/Laravel 백엔드
        ├── fe-developer (sonnet) — React/TypeScript 프론트엔드
        ├── infra-engineer (sonnet) — Docker/CI
        └── research (sonnet) — 기술 조사/문서화
```

## 에이전트

| 에이전트 | Model | 역할 |
|---------|-------|------|
| coordinator | sonnet | 요청 접수 + 적절한 에이전트 라우팅 |
| be-developer | sonnet | PHP/Laravel 백엔드 — 하네스 평가/패턴/추천 서비스 구현 |
| fe-developer | sonnet | React/TypeScript — 하네스 위자드/대시보드/캔버스 구현 |
| infra-engineer | sonnet | Docker, CI/CD, 배포 |
| research | sonnet | 논문/문서/오픈소스/웹 조사 및 docs/research/ 문서화 |

## 스킬

### 에이전트 직접 호출 (Coordinator 미경유)

| 스킬 | 대상 에이전트 | 설명 |
|------|-------------|------|
| `/be {작업}` | be-developer | PHP/Laravel 백엔드 작업 직접 위임 |
| `/fe {작업}` | fe-developer | React/TypeScript 프론트엔드 작업 직접 위임 |
| `/infra {작업}` | infra-engineer | Docker/CI 인프라 작업 직접 위임 |
| `/research {주제}` | research | 기술 조사/분석 작업 위임 |

### 복합 작업 (Coordinator 경유)

| 스킬 | 설명 |
|------|------|
| `/fullstack {작업}` | 복합(풀스택) 작업 → Coordinator가 분해 후 순차 위임 |
| `/request FORGE-{번호}` | Plane 이슈 기반 작업 → Coordinator가 분석하여 라우팅 |

### 프로젝트 관리

| 스킬 | 설명 |
|------|------|
| `/plane-issues` | Plane Todo/In Progress 이슈 목록 조회 |
| `/plane-start FORGE-{번호}` | 이슈 작업 시작 (In Progress + 브랜치 생성) |
| `/plane-done FORGE-{번호}` | 이슈 작업 완료 (Done + 코멘트) |

### 디자인

| 스킬 | 설명 |
|------|------|
| `/audit` | UI 디자인 감사 |
| `/polish` | UI 디자인 다듬기 |
| `/normalize` | UI 일관성 정규화 |

## 규칙 구조

```
rules/
├── common/          # 공통 규칙 (항상 로드)
├── governance/      # 조직도, 승인 규칙 (항상 로드)
├── backend/
│   ├── php/         # PHP 코딩 표준 (**/*.php)
│   └── laravel/     # Laravel 규칙 (**/*.php)
├── frontend/
│   ├── typescript/  # TypeScript 규칙 (**/*.ts, **/*.tsx)
│   └── react/       # React 규칙 (**/*.tsx)
└── infra/           # Docker 규칙 (Dockerfile*, docker-compose*)
```
