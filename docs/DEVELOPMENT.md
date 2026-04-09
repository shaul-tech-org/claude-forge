# 개발 환경 가이드

## 사전 요구사항

| 도구 | 버전 |
|------|------|
| Docker | 24+ |
| Docker Compose | v2+ |
| Node.js | 20+ (프론트엔드 로컬 실행 시) |
| PHP | 8.4+ (백엔드 로컬 실행 시) |
| Composer | 2.x (백엔드 로컬 실행 시) |

## Quick Start (Docker)

```bash
# 클론
git clone https://github.com/shaul-tech-org/claude-forge.git
cd claude-forge

# 초기 설정 (env 복사 + 빌드 + 기동 + 마이그레이션)
make init

# 접속
# API:      http://localhost:8000
# Frontend: http://localhost:5173
# DB:       localhost:5433 (user: forge, db: claude_forge)
```

## 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| frontend | 5173 | React + Vite 개발 서버 |
| backend | (nginx 경유) | PHP 8.4-FPM + Laravel 13 |
| nginx | 80, 8000 | 리버스 프록시 |
| db | 5433 | PostgreSQL 18 |

## 환경 변수

### 루트 `.env`

```bash
COMPOSE_PROJECT_NAME=claude-forge
PLANE_URL=https://plane.shaul.kr
PLANE_WORKSPACE_SLUG=shaul-org
PLANE_API_KEY=your_plane_api_key
```

### 백엔드 `backend/.env`

`backend/.env.example`을 복사하여 사용합니다. `make init` 실행 시 자동 복사됩니다.

주요 설정:
- `DB_CONNECTION=pgsql`
- `DB_HOST=db` (Docker 네트워크 내 서비스명)
- `DB_PORT=5432`
- `DB_DATABASE=claude_forge`
- `DB_USERNAME=forge`

### 프론트엔드 `frontend/.env`

`frontend/.env.example`을 복사하여 사용합니다.

주요 설정:
- `VITE_API_BASE_URL=http://localhost:8000/api/v1`

## Makefile 명령어

### 기본

```bash
make up          # 전체 서비스 기동 (백그라운드)
make down        # 전체 서비스 중지
make build       # 이미지 빌드
make rebuild     # 캐시 없이 재빌드 + 기동
make restart     # 전체 서비스 재시작
make logs        # 전체 로그 (follow)
make ps          # 서비스 상태 확인
```

### 백엔드

```bash
make backend-shell              # 백엔드 컨테이너 bash 접속
make artisan cmd="migrate"      # artisan 명령 실행
make composer cmd="require ..."  # composer 명령 실행
make migrate                    # 마이그레이션 실행
make seed                       # 시더 실행
make tinker                     # tinker 접속
```

### 프론트엔드

```bash
make frontend-shell            # 프론트엔드 컨테이너 sh 접속
make npm cmd="install ..."     # npm 명령 실행
```

### 데이터베이스

```bash
make db-shell     # psql 접속
make db-reset     # DB 리셋 (drop + create + migrate)
```

### 프로덕션

```bash
make build-prod   # 프로덕션 이미지 빌드
make up-prod      # 프로덕션 모드 기동
make deploy       # 프로덕션 배포 (pull + build + up + migrate)
```

## 백엔드 개발

### 디렉토리 구조

```
backend/app/
├── DTOs/           # Data Transfer Objects
│   ├── Cli/        # ClaudeConfig, ScanResult, ApplyResult
│   ├── Harness/    # EvaluationResult, ContextBudget, Pattern
│   └── Recommendation/  # TechStack, RuleTemplate, SkillTemplate
├── Http/
│   ├── Controllers/
│   │   ├── Cli/    # Scan, Validate, Apply
│   │   ├── Harness/     # Evaluate, Patterns, ContextBudget
│   │   └── Recommendation/  # Stacks, Recommendations, RulesDb
│   └── Requests/   # Form Request 검증
├── Services/
│   ├── Cli/        # Scanner, Validator, Writer, FrontmatterParser
│   ├── Harness/    # Evaluation, PatternRegistry, ContextBudget
│   └── Recommendation/  # TechStackRegistry, RecommendationEngine
└── Models/
```

### 테스트

```bash
# 전체 테스트
make artisan cmd="test"

# 특정 테스트
make artisan cmd="test --filter=HarnessEvaluation"

# 코드 스타일 검사
docker exec claude-forge-backend-1 ./vendor/bin/pint --test

# 코드 스타일 적용
docker exec claude-forge-backend-1 ./vendor/bin/pint
```

## 프론트엔드 개발

### 디렉토리 구조

```
frontend/src/
├── api/            # API 클라이언트 (harness.ts, recommendations.ts)
├── components/
│   ├── canvas/     # React Flow 캔버스 + 노드 8종 + 엣지 6종
│   ├── config/     # CLAUDE.md, Settings, MCP, Hooks 편집기
│   ├── harness/    # 평가 대시보드
│   ├── panel/      # 속성 편집 패널
│   ├── recommend/  # 권장사항 패널
│   ├── toolbar/    # 도구 모음 + 내보내기
│   ├── wizard/     # 5단계 온보딩 마법사
│   └── layout/     # 레이아웃
├── contexts/       # CanvasContext (전역 상태)
├── hooks/          # useCanvas, useDragAndDrop, useRecommendations
├── lib/            # defaults, export, patternLoader, id
├── pages/          # Home, Create, Analyze, Patterns, Learn
└── types/          # node (8종), edge (6종), project
```

### 테스트

```bash
# 전체 테스트
cd frontend && npx vitest run

# watch 모드
cd frontend && npx vitest

# 특정 파일
cd frontend && npx vitest run src/lib/patternLoader.test.ts

# 타입 체크
cd frontend && npx tsc --noEmit
```

## E2E 테스트 (Playwright)

```bash
# 실행
npx playwright test

# UI 모드
npx playwright test --ui

# 특정 스펙
npx playwright test e2e/canvas-builder.spec.ts
```

## 트러블슈팅

### Docker 관련

**포트 충돌**
```bash
# 사용 중인 포트 확인
lsof -i :5173
lsof -i :8000
```

**볼륨 초기화**
```bash
make clean  # 볼륨 포함 전체 정리
make init   # 재초기화
```

### 백엔드

**composer 의존성 문제**
```bash
make composer cmd="install --no-cache"
```

**마이그레이션 오류**
```bash
make db-reset  # DB 리셋 후 재마이그레이션
```

### 프론트엔드

**node_modules 문제**
```bash
make npm cmd="ci"  # clean install
```
