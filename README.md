# claude-forge

> Harness Engineering Platform — AI 하네스를 설계·구축·평가하는 도구

Claude Code 사용자가 자신의 작업 방식에 맞는 AI 하네스를 설계(Design), 구축(Build), 평가(Evaluate), 진화(Evolve)할 수 있는 웹 플랫폼입니다.

## 핵심 기능

- **하네스 설계 위자드** — 단계별 질문으로 최적의 하네스 구성 생성
- **캔버스 빌더** — React Flow 기반 드래그 앤 드롭으로 에이전트·스킬·규칙 시각적 조합
- **패턴 라이브러리** — 검증된 하네스 설계 패턴 탐색 및 적용
- **평가 대시보드** — 하네스 성능 분석 및 개선 제안
- **AI 추천** — 기술 스택 기반 설정 자동 추천

## 6축 프레임워크

| 축 | 설명 |
|---|------|
| **Context Engineering** | 모델에 전달되는 정보의 질과 양 |
| **Verification Loops** | 출력물의 자동 검증 |
| **State Management** | 세션 간 학습과 기억 |
| **Tool Orchestration** | 도구 호출의 최적 조합 |
| **Human-in-the-Loop** | 위험 결정의 사람 개입 |
| **Lifecycle Management** | 이벤트 기반 자동화 |

## 기술 스택

| 항목 | 기술 |
|------|------|
| 백엔드 | PHP 8.4 + Laravel 13 |
| 프론트엔드 | React 19 + TypeScript + React Flow 12 + Tailwind CSS 4 |
| DB | PostgreSQL 18 |
| 인프라 | Docker Compose + Nginx |
| 테스트 | Pest + Vitest + Playwright |

## Quick Start

```bash
# 클론
git clone https://github.com/shaul-tech-org/claude-forge.git
cd claude-forge

# 초기 설정 (env 복사 + 빌드 + 기동 + 마이그레이션)
make init

# 접속
# API:      http://localhost:8000
# Frontend: http://localhost:5173
```

### 주요 명령어

```bash
make up          # 서비스 기동
make down        # 서비스 중지
make logs        # 로그 확인
make migrate     # DB 마이그레이션
make db-reset    # DB 리셋
make help        # 전체 명령어 목록
```

## 프로젝트 구조

```
claude-forge/
├── backend/           # PHP 8.4 + Laravel 13 API
│   ├── app/DTOs/      # Data Transfer Objects
│   ├── app/Services/  # 비즈니스 로직 (Cli, Harness, Recommendation)
│   ├── app/Http/      # Controllers, Requests
│   └── routes/api.php
├── frontend/          # React 19 + React Flow 12
│   ├── src/components/  # canvas, wizard, panel, toolbar
│   ├── src/hooks/       # useCanvas, useDragAndDrop
│   ├── src/pages/       # Home, Create, Analyze, Learn, Patterns
│   └── src/types/       # node, edge, project
├── infra/             # Nginx, PostgreSQL 설정
├── e2e/               # Playwright E2E 테스트
├── docs/              # PRD, 아키텍처, 리서치 문서
├── scripts/           # 자동화 스크립트
└── .claude/           # 하네스 구성
    ├── agents/        # 에이전트 7개
    ├── skills/        # 스킬 28개
    ├── rules/         # 규칙 10개
    └── agent-memory/  # 에이전트별 영속 메모리
```

## 하네스 구성

이 프로젝트 자체가 claude-forge의 첫 번째 활용 사례(showcase)입니다.

### 에이전트

| 에이전트 | 역할 |
|---------|------|
| coordinator | 요청 분석 + 적절한 에이전트 라우팅 |
| be-developer | PHP/Laravel 백엔드 구현 |
| fe-developer | React/TypeScript 프론트엔드 구현 |
| infra-engineer | Docker, CI/CD 관리 |
| research | 기술 조사 및 문서화 |
| pm-agent | 이슈 분해, 스프린트 관리 (Plane 연동) |
| refactor | 격리된 worktree에서 안전한 리팩토링 |

### 스킬 (주요)

| 카테고리 | 스킬 |
|---------|------|
| 에이전트 위임 | `/be`, `/fe`, `/infra`, `/research`, `/fullstack` |
| PM 관리 | `/pm`, `/pm-status`, `/plane-issues`, `/plane-start`, `/plane-done` |
| 품질 | `/brainstorm`, `/harness-review`, `/refactor` |
| 디자인 | `/frontend-design`, `/audit`, `/critique`, `/polish` 외 7개 |

## 문서

- [개발 환경 가이드](docs/DEVELOPMENT.md)
- [기여 가이드](CONTRIBUTING.md)
- [제품 요구사항 (PRD)](docs/PRD.md)
- [리서치 인덱스](docs/research/INDEX.md)

## 라이선스

[MIT](LICENSE)
