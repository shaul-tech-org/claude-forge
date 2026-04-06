# claude-forge

Claude Code의 `.claude` 설정을 드래그 앤 드롭으로 생성하고 최적화하는 웹 빌더.
이 프로젝트 자체가 claude-forge의 첫 번째 활용 사례(showcase)이다.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 백엔드 | PHP 8.4 + Laravel 13 |
| 프론트엔드 | TypeScript + React + React Flow + Tailwind CSS |
| DB | PostgreSQL 18 |
| AI 엔진 | 로컬 Claude Code CLI |
| 인프라 | Docker Compose |

## 조직도

```
사용자
  └── Coordinator (sonnet) — 요청 분석 + 라우팅
        ├── be-developer (sonnet) — PHP/Laravel 백엔드
        ├── fe-developer (sonnet) — React/TypeScript 프론트엔드
        └── infra-engineer (sonnet) — Docker/CI
```

## 에이전트

| 에이전트 | Model | 역할 |
|---------|-------|------|
| coordinator | sonnet | 요청 접수 + 적절한 에이전트 라우팅 |
| be-developer | sonnet | PHP/Laravel 백엔드 구현 |
| fe-developer | sonnet | React/TypeScript/React Flow 프론트엔드 구현 |
| infra-engineer | sonnet | Docker, CI/CD, 배포 |

## 스킬

| 스킬 | 설명 |
|------|------|
| /project-context | 프로젝트 컨텍스트 + 공통 원칙 |
| /request | 요청을 Coordinator가 분석하여 라우팅 |

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
