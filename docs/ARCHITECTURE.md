# 시스템 아키텍처

## 전체 구조

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │────▶│    Nginx     │────▶│   Backend    │
│  React 19   │     │  (Reverse    │     │  Laravel 13  │
│  Vite 5173  │     │   Proxy)     │     │  PHP-FPM     │
└─────────────┘     └──────────────┘     └──────┬───────┘
                         80/8000                 │
                                          ┌──────▼───────┐
                                          │ PostgreSQL 18│
                                          │   :5433      │
                                          └──────────────┘
```

## 백엔드 계층 구조

```
Request → Controller → Service → DTO → Response
              ↑
         FormRequest (검증)
```

### 도메인 구분

| 도메인 | 역할 | 주요 서비스 |
|--------|------|-----------|
| **Cli** | `.claude/` 설정 스캔/검증/적용 | Scanner, Validator, Writer |
| **Harness** | 6축 평가, 패턴, 컨텍스트 예산 | EvaluationService, PatternRegistry, ContextBudgetCalculator |
| **Recommendation** | 기술 스택 기반 설정 추천 | TechStackRegistry, RecommendationEngine |

### 데이터 흐름

```
# 권장사항 생성
사용자 (React, Laravel 선택)
  → RecommendationEngine.recommend()
    → resolveImplies() (react → typescript, jsx)
    → collectRules() + collectSkills() (중복 제거)
  → RecommendationResult { stacks[], rules[], skills[] }

# 하네스 평가
캔버스 구성 (agents, skills, rules, hooks)
  → HarnessEvaluationService.evaluate()
    → 6축 각각 체크리스트 기반 점수 산출
    → 가중치 적용 (context: 1.0, verification: 1.0, state: 0.8, tools: 0.9, human: 0.7, lifecycle: 0.6)
  → EvaluationResult { scores, overall, grade, top_priority }
```

## 프론트엔드 계층 구조

```
Pages → Components → Hooks → API → Backend
                       ↕
                    Context (전역 상태)
                       ↕
                   localStorage (영속)
```

### 페이지 구성

| 경로 | 페이지 | 기능 |
|------|--------|------|
| `/` | HomePage | 대시보드 — 마법사/분석/패턴/학습 진입점 |
| `/create` | CreatePage | 5단계 마법사 (Profile → Work Types → Pattern → 6축 → Review) |
| `/create/builder` | Canvas Builder | React Flow 캔버스 — 노드 드래그, 속성 편집, 내보내기 |
| `/analyze` | AnalyzePage | ZIP 업로드 → 6축 평가 → 등급(S~D) + 레이더 차트 |
| `/patterns` | PatternsPage | 패턴 라이브러리 탐색 |
| `/learn` | LearnPage | 학습 가이드 |

### 캔버스 시스템

**노드 8종**: Agent, Skill, Rule, Hook, MCP, Memory, Permission, Settings

**엣지 6종**: Delegation (Agent→Agent), Uses (Agent→Skill), Applies (Agent→Rule), Trigger (Agent→Hook), Reference (Agent→Memory/Permission), Load (*→MCP)

**상태 관리**: CanvasContext (React Context) → localStorage 자동 동기화

## 6축 프레임워크 기술 매핑

| 축 | 백엔드 구현 | 프론트엔드 구현 |
|---|-----------|--------------|
| Context | CLAUDE.md 파싱, 규칙 경로 검증 | ClaudeMdEditor, RulePropertyForm |
| Verification | 테스트/린트/보안 규칙 체크리스트 | 마법사 Step 4 체크항목 |
| State | 메모리 활성화 검사 | MemoryNode, Settings 편집 |
| Tools | 스킬/MCP/멀티에이전트 검사 | SkillNode, McpNode, Toolbar |
| Human | 권한/승인 게이트 검사 | PermissionNode, SettingsEditor |
| Lifecycle | Hook 이벤트 검사 | HookNode, HooksEditor |

## API 엔드포인트

### CLI (`/api/v1/cli/`)

| 메서드 | 경로 | 기능 |
|--------|------|------|
| POST | `/scan` | `.claude/` 디렉토리 스캔 |
| POST | `/validate` | 설정 유효성 검증 |
| POST | `/apply` | 설정을 프로젝트에 적용 (merge/overwrite) |

### Recommendation (`/api/v1/`)

| 메서드 | 경로 | 기능 |
|--------|------|------|
| GET | `/stacks` | 기술 스택 목록 |
| POST | `/recommendations` | 스택 기반 설정 추천 |
| GET | `/rules-db` | 전체 규칙 DB |
| GET | `/rules-db/{stackId}` | 특정 스택 규칙 |

### Harness (`/api/v1/harness/`)

| 메서드 | 경로 | 기능 |
|--------|------|------|
| GET | `/patterns` | 패턴 목록 |
| GET | `/patterns/{id}` | 패턴 상세 |
| POST | `/evaluate` | 6축 평가 |
| POST | `/context-budget` | 토큰 예산 계산 |
| POST | `/recommend` | 팀/우선순위 기반 추천 |
| POST | `/import/github` | GitHub에서 설정 import |

## 인프라

```yaml
# docker-compose.yml
services:
  frontend:   # React + Vite (:5173)
  backend:    # PHP 8.4-FPM + Laravel 13
  nginx:      # 리버스 프록시 (:80, :8000)
  db:         # PostgreSQL 18 (:5433)
```

### CI/CD (GitHub Actions)

- `backend-ci.yml`: PHP lint → Pest 테스트
- `backend-cd.yml`: Docker 빌드 → Harbor 배포
- `frontend-ci.yml`: TypeScript 체크 → Vitest → ESLint
- `frontend-cd.yml`: Docker 빌드 → Harbor 배포
