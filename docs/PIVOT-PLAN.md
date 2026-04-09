# claude-forge 피벗 기획서: Harness Engineering Platform

> 작성일: 2026-04-08
> 버전: v1.0 (초안)
> 상태: 승인됨

---

## 1. Executive Summary

claude-forge를 **".claude 설정 파일 빌더"**에서 **"Harness Engineering 가이드 & 생성 플랫폼"**으로 전환한다.

| | AS-IS | TO-BE |
|---|---|---|
| **정체성** | .claude 폴더 드래그앤드롭 빌더 | Harness Engineering 플랫폼 |
| **핵심 가치** | "설정 파일을 쉽게 만들자" | "내 작업 방식에 맞는 하네스를 설계하자" |
| **타겟 사용자** | Claude Code 초보자 | 초보자 ~ 중급자 (하네스 개념을 배우며 구축) |
| **최종 산출물** | .claude/ ZIP 다운로드 | 완성된 하네스 + 설계 문서 + 평가 리포트 |
| **차별점** | 파일 생성기 | 방법론 + 도구 + 평가의 통합 경험 |

### 왜 피벗하는가?

1. **시장 변화**: 2026년 상반기, Harness Engineering이 업계 표준 개념으로 부상 (Anthropic, Martin Fowler, OpenAI 모두 공식 문서 발행)
2. **경쟁 차별화**: 설정 파일 생성만으로는 oh-my-claudecode(26K+ stars), moai-adk(28 agents) 등 커뮤니티 도구와 차별화 불가
3. **실제 니즈**: 사용자들이 겪는 진짜 어려움은 "파일 형식"이 아닌 "어떤 하네스를 어떻게 설계할지 모르는 것"

---

## 2. 제품 비전

> **"모든 개발자가 자신만의 AI 하네스를 설계하고, 구축하고, 진화시킬 수 있는 플랫폼"**

### 핵심 원칙

1. **교육 + 생성의 결합** — 만드는 과정 자체가 학습
2. **아키텍처 우선** — 파일 생성 전에 설계 의도를 먼저 정의
3. **측정 가능** — 하네스 품질을 수치로 평가하고 개선 가이드 제공
4. **점진적 진화** — 빈 프로젝트부터 고급 하네스까지 성장 경로 제공

---

## 3. Harness Engineering 6축 프레임워크

플랫폼의 이론적 기반. 모든 기능이 이 6축에 매핑된다.

```
┌─────────────────────────────────────────────────┐
│               HARNESS ENGINEERING               │
├─────────┬─────────┬─────────┬─────────┬────────┤
│ Context │ Verify  │ State   │ Tools   │ Human  │ Lifecycle
│ Eng.    │ Loops   │ Mgmt    │ Orch.   │ in Loop│ Hooks
├─────────┼─────────┼─────────┼─────────┼────────┤
│CLAUDE.md│Evaluator│Memory   │Agent    │Permis- │Hooks
│Rules    │Agent    │CLAUDE.md│Skills   │sion    │Settings
│@imports │Test     │agent-   │MCP      │Modes   │Events
│Agents   │Runner   │memory/  │Commands │approval│lifecycle
│frontmt  │Coverage │settings │tools[]  │gates   │mgmt
└─────────┴─────────┴─────────┴─────────┴────────┘
```

| 축 | 설명 | Claude Code 매핑 |
|---|---|---|
| **Context Engineering** | 모델에 전달되는 정보의 질과 양 관리 | CLAUDE.md, Rules, @참조, Agent frontmatter |
| **Verification Loops** | 출력물의 품질을 자동 검증 | Evaluator agent, Test runner, Coverage 체크 |
| **State Management** | 세션 간 지속되는 상태와 학습 | Memory, agent-memory, CLAUDE.md 업데이트 |
| **Tool Orchestration** | 도구 호출의 순서와 조합 최적화 | Agent tools[], Skills, MCP 서버 |
| **Human-in-the-Loop** | 위험한 결정에서의 사람 개입 | Permission modes, approval gates |
| **Lifecycle Management** | 이벤트 기반 자동화 | Hooks (Pre/PostToolUse, Notification 등) |

---

## 4. 핵심 기능 설계

### F1: Harness Wizard (신규 — 핵심)

기존 Onboarding Wizard를 **Harness 설계 마법사**로 전면 교체.

**Flow:**
```
[1. 프로젝트 프로필]    사용 언어, 프레임워크, 팀 규모, 목표
        ↓
[2. 작업 유형 선택]     코딩, 리뷰, 테스트, 리서치, 문서화...
        ↓
[3. 아키텍처 패턴 추천]  Pipeline / Fan-out / Expert Pool / ...
        ↓
[4. 6축 설계]          축별로 필요한 구성 요소 선택/커스터마이징
        ↓
[5. Context Budget]    토큰 예산 시각화 — 256K 안에 들어오는지 확인
        ↓
[6. 생성 & 내보내기]    .claude/ 폴더 + 설계 문서 + README
```

**Step 3 상세 — 아키텍처 패턴 카탈로그:**

| 패턴 | 설명 | 적합한 경우 | 에이전트 구성 예 |
|---|---|---|---|
| **Solo** | 에이전트 1개, 스킬로 확장 | 개인 프로젝트, 소규모 | main + skills |
| **Pipeline** | 순차 처리 체인 | CI/CD, 데이터 처리 | planner → coder → tester → reviewer |
| **Fan-out/Fan-in** | 병렬 분배 후 결과 병합 | 대규모 리팩토링, 마이그레이션 | coordinator → [be, fe, infra] → merger |
| **Expert Pool** | 전문가 자동 위임 | 풀스택 개발 | coordinator → {be, fe, db, devops} |
| **Producer-Reviewer** | 생성 + 리뷰 반복 | 품질 중시 프로젝트 | generator ↔ reviewer (loop) |
| **Supervisor** | 감독자가 품질 관리 | 주니어 팀 지원 | supervisor → workers + evaluator |
| **3-Agent (Anthropic)** | Planner-Generator-Evaluator | 복잡한 기능 구현 | planner → generator → evaluator (GAN식) |

각 패턴은 React Flow 캔버스에서 시각화되고, 노드/엣지가 미리 배치된 상태로 제공.

**Step 5 상세 — Context Budget Visualizer:**

```
┌── Context Budget (256K tokens) ─────────────────┐
│ ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  사용량│
│                                                  │
│ System Prompt:     3,200 tk  ████                │
│ System Tools:     11,000 tk  █████████           │
│ CLAUDE.md:         2,800 tk  ███                 │
│ Rules (4 files):   3,600 tk  ████                │
│ Agent FMs (3):     1,200 tk  ██                  │
│ Auto Memory:         800 tk  █                   │
│ ─────────────────────────────                    │
│ 고정 합계:         22,600 tk  (8.8%)              │
│ 작업 가용:        233,400 tk  (91.2%)             │
│                                                  │
│ ⚠️ 에이전트 10개 추가 시: 고정 +4,000tk → 가용 89.6% │
│ ✅ 현재 구성은 권장 범위 내                          │
└──────────────────────────────────────────────────┘
```

이 시각화는 사용자가 에이전트/룰을 추가할 때마다 실시간 업데이트. Context 낭비를 방지하는 핵심 도구.

### F2: Visual Harness Builder (기존 Canvas 진화)

기존 React Flow 캔버스를 하네스 아키텍처 설계 도구로 업그레이드.

**기존 → 변경:**

| 기존 | 변경 |
|---|---|
| 3 노드 타입 (Agent, Skill, Rule) | 8+ 노드 타입 (+ Hook, MCP, Memory, Permission, CLAUDE.md) |
| 노드 = 개별 파일 | 노드 = 하네스 구성 요소 (6축 색상 코딩) |
| 연결 = 단순 참조 | 연결 = 데이터/제어 흐름 (위임, 트리거, 의존성) |
| 속성 패널 = YAML 편집 | 속성 패널 = 가이드 폼 + 실시간 검증 |
| 패턴 없음 | 아키텍처 패턴 프리셋 드롭 |

**새 노드 타입:**

| 노드 | 색상 | 설명 |
|---|---|---|
| Agent | 보라 | 서브에이전트 정의 |
| Skill | 파랑 | 스킬 정의 |
| Rule | 초록 | 규칙 파일 |
| Hook | 주황 | 라이프사이클 훅 |
| MCP Server | 빨강 | 외부 도구 서버 |
| Memory | 노랑 | 메모리 설정 (CLAUDE.md, auto-memory) |
| Permission | 회색 | 권한 모드 게이트 |
| Settings | 검정 | settings.json 설정 |

**엣지 타입:**

| 엣지 | 표현 | 의미 |
|---|---|---|
| 위임 (→) | 실선 화살표 | Agent가 Agent를 스폰 |
| 트리거 (⟿) | 점선 화살표 | Hook이 이벤트에서 실행 |
| 참조 (---) | 대시선 | Rule이 특정 경로에 적용 |
| 로드 (⇒) | 굵은 화살표 | Skill이 Agent에 사전 로드 |

### F3: Harness Evaluation (신규 — 핵심)

기존 하네스 또는 새로 만든 하네스를 6축 기준으로 평가.

**평가 항목 (각 축 0~100점):**

| 축 | 평가 기준 | 주요 체크 |
|---|---|---|
| Context | 토큰 효율성, 정보 중복도 | 256K 이내? 불필요한 agent frontmatter 없는지? |
| Verification | 자동 검증 장치 존재 여부 | Evaluator agent? Test skill? Coverage hook? |
| State | 학습 메커니즘 | Memory 활성화? CLAUDE.md 업데이트 규칙? |
| Tools | 도구 구성의 적절성 | 최소 권한? MCP 필요성? 도구 중복? |
| Human | 안전 장치 | Permission mode 적절? 위험 명령 차단 hook? |
| Lifecycle | 자동화 수준 | Hook 커버리지? 알림? 로깅? |

**종합 점수 체계:**

| 등급 | 점수 | 설명 |
|---|---|---|
| S | 90+ | 프로덕션 수준, 자기 진화 가능 |
| A | 75-89 | 안정적, 대부분의 축 커버 |
| B | 60-74 | 기본 구성 완료, 개선 여지 |
| C | 40-59 | 핵심 축 누락, 즉시 보완 필요 |
| D | 0-39 | 하네스라 부르기 어려움 |

**출력물:**
- 6축 레이더 차트
- 축별 개선 제안 (구체적인 파일/설정 변경 가이드)
- 벤치마크 비교 (커뮤니티 평균, 추천 패턴의 기대치)

### F4: Pattern Library (신규)

커뮤니티 하네스 패턴을 카탈로그화하여 참고/복제 가능하게.

**카테고리:**

| 카테고리 | 설명 | 예시 |
|---|---|---|
| **스타터** | 초보자용 최소 하네스 | Solo, Solo+Skills |
| **팀 표준** | 팀 공유용 base harness | Expert Pool + Rules + Hooks |
| **도메인 특화** | 특정 기술 스택 최적화 | Laravel Hexagonal, React+Next.js, Python ML |
| **워크플로우** | 특정 작업 프로세스 | TDD Pipeline, PR Review, Migration |
| **고급** | 자기 진화, 멀티 팀 | Self-evolving, Hierarchical Delegation |

**각 패턴 포함 내용:**
- 아키텍처 다이어그램 (React Flow 프리셋)
- 필요 파일 목록 및 템플릿
- 6축 기대 점수
- 적용 사례 및 A/B 결과 (있는 경우)
- "이 패턴으로 시작" 버튼 (Wizard에 로드)

### F5: Recommendation Engine 업그레이드

기존 추천 엔진의 구조를 유지하되, 하네스 관점으로 확장.

**기존 → 변경:**

| 기존 | 변경 |
|---|---|
| 기술 스택 → Rules 추천 | 기술 스택 + 작업 유형 → 전체 하네스 추천 |
| RulesDatabase만 사용 | RulesDB + PatternDB + HarnessDB |
| 단일 계층 추천 | 체인 추천 (기술스택→패턴→에이전트→스킬→룰→훅) |

**새 추천 흐름:**
```
사용자 입력: "Laravel + React, 3명 팀, 품질 중시"
    ↓
[패턴 추천] Expert Pool + Producer-Reviewer 하이브리드
    ↓
[에이전트 추천] coordinator, be-dev, fe-dev, reviewer (4개)
    ↓
[스킬 추천] /test, /review, /deploy + 도메인 스킬
    ↓
[규칙 추천] Laravel Eloquent, React hooks, 테스트 커버리지
    ↓
[훅 추천] 위험 명령 차단, 자동 포맷, 테스트 게이트
    ↓
[Context Budget 검증] 총 고정 토큰 계산 → 경고 or 승인
```

### F6: Import & Analyze (기존 CLI 기능 확장)

기존 `/cli/scan` API를 하네스 분석 도구로 확장.

**기능:**
1. **기존 .claude/ 업로드** → 구조 파싱 → 6축 평가 → 개선 제안
2. **GitHub 저장소 URL** → 자동 클론 → .claude/ 추출 → 분석
3. **커뮤니티 패턴 비교** → 유사 패턴 찾기 → 차이점 하이라이트

---

## 5. 기존 코드 재사용 분석

### Frontend (~3,400 LOC)

| 컴포넌트 | 재사용 | 변경 내용 |
|---|---|---|
| React Flow 캔버스 | ✅ 거의 그대로 | 노드 타입 추가, 엣지 타입 추가 |
| useCanvas hook | ✅ 확장 | 패턴 프리셋 로드 기능 추가 |
| useRecommendations hook | ✅ 확장 | 하네스 추천 API 연동 |
| PropertyPanel | ✅ 리팩토링 | 6축 관점 가이드 폼으로 개편 |
| ConfigEditors (4종) | ✅ 그대로 | CLAUDE.md, Settings, MCP, Hooks 편집기 유지 |
| Wizard | ❌ 전면 교체 | Harness Wizard로 재작성 |
| Toolbar | ✅ 확장 | 평가, 패턴 로드 버튼 추가 |
| Node 컴포넌트 (3종) | ✅ 확장 | 5종 추가 (Hook, MCP, Memory, Permission, Settings) |

**예상 재사용율: ~60%**

### Backend (~3,400 LOC)

| 컴포넌트 | 재사용 | 변경 내용 |
|---|---|---|
| TechStackRegistry | ✅ 그대로 | 기술 스택 DB 유지 |
| RulesDatabase | ✅ 그대로 | 규칙 DB 유지 |
| RecommendationEngine | ✅ 확장 | PatternDB, HarnessDB 연동 추가 |
| CliScanController | ✅ 확장 | 6축 평가 로직 추가 |
| CliApplyController | ✅ 그대로 | 파일 쓰기 유지 |
| CliValidateController | ✅ 확장 | 하네스 레벨 검증 추가 |
| FrontmatterParser | ✅ 그대로 | YAML 파싱 유지 |

**예상 재사용율: ~70%**

### Infrastructure

| 컴포넌트 | 재사용 |
|---|---|
| Docker Compose | ✅ 그대로 |
| CI/CD (4 pipelines) | ✅ 그대로 |
| Makefile | ✅ 그대로 |

**예상 재사용율: ~95%**

---

## 6. 신규 개발 항목

### 백엔드 신규

| 항목 | 설명 | 우선순위 |
|---|---|---|
| `HarnessEvaluationService` | 6축 평가 로직 (각 축 0~100점 산출) | P0 |
| `PatternRegistry` | 아키텍처 패턴 카탈로그 데이터 | P0 |
| `HarnessRecommendationService` | 패턴→에이전트→스킬→룰→훅 체인 추천 | P0 |
| `ContextBudgetCalculator` | 토큰 추정 (파일별 근사치 계산) | P1 |
| `PatternTemplateService` | 패턴 프리셋 → React Flow 노드/엣지 변환 | P1 |
| `GitHubImportService` | 저장소 URL → .claude/ 추출 | P2 |

### 프론트엔드 신규

| 항목 | 설명 | 우선순위 |
|---|---|---|
| `HarnessWizard` (5 steps) | Wizard 전면 재작성 | P0 |
| `ContextBudgetVisualizer` | 토큰 예산 바 차트 | P0 |
| `EvaluationDashboard` | 6축 레이더 차트 + 개선 제안 | P0 |
| `PatternSelector` | 패턴 카탈로그 브라우저 | P1 |
| 추가 Node 컴포넌트 (5종) | Hook, MCP, Memory, Permission, Settings | P1 |
| 추가 Edge 컴포넌트 (3종) | 트리거, 참조, 로드 | P1 |
| `HarnessExportReport` | 설계 문서 + 평가 리포트 내보내기 | P2 |

---

## 7. 정보 아키텍처 (IA) 재설계

### 현재 IA
```
홈 → [Canvas Builder] → [Export]
```

### 새 IA
```
홈 (대시보드)
├── 새 하네스 만들기
│   └── Harness Wizard (5 steps)
│       → Canvas Builder (패턴 프리셋 로드됨)
│       → Context Budget 확인
│       → Export
│
├── 기존 하네스 분석
│   ├── .claude/ 업로드
│   ├── GitHub URL 입력
│   └── → 6축 평가 → 개선 제안
│
├── 패턴 라이브러리
│   ├── 카테고리별 탐색
│   ├── 상세 보기 (다이어그램 + 설명)
│   └── "이 패턴으로 시작" → Wizard
│
├── 학습 가이드
│   ├── Harness Engineering이란?
│   ├── 6축 프레임워크 설명
│   ├── 시작하기 (튜토리얼)
│   └── FAQ
│
└── 설정
```

### 라우트 구조
```
/                          # 대시보드
/create                    # Harness Wizard
/create/builder            # Canvas Builder
/analyze                   # 기존 하네스 분석
/patterns                  # 패턴 라이브러리
/patterns/:id              # 패턴 상세
/learn                     # 학습 가이드
/learn/:topic              # 주제별 가이드
```

---

## 8. API 재설계

### 기존 API 유지
```
GET  /api/v1/health
GET  /api/v1/stacks
POST /api/v1/recommendations
GET  /api/v1/rules-db
GET  /api/v1/rules-db/{stackId}
POST /api/v1/cli/scan
POST /api/v1/cli/apply
POST /api/v1/cli/validate
```

### 신규 API

```
# 패턴 카탈로그
GET  /api/v1/patterns                    # 패턴 목록
GET  /api/v1/patterns/{id}               # 패턴 상세
GET  /api/v1/patterns/{id}/template      # 패턴의 React Flow 프리셋 (노드/엣지 JSON)

# 하네스 추천
POST /api/v1/harness/recommend           # 프로필 → 전체 하네스 추천
  body: { stacks: [], teamSize: N, priorities: [], workTypes: [] }

# 하네스 평가
POST /api/v1/harness/evaluate            # .claude/ 구조 → 6축 점수
  body: { agents: [], skills: [], rules: [], hooks: {}, settings: {}, claudeMd: "" }

# Context Budget
POST /api/v1/harness/context-budget      # 구성 → 토큰 예산 계산
  body: { agents: [], rules: [], claudeMd: "", memory: bool }

# GitHub Import
POST /api/v1/import/github               # 저장소 URL → .claude/ 추출
  body: { url: "https://github.com/..." }
```

---

## 9. 데이터 모델

### PatternRegistry (정적 데이터, PHP)

```php
[
    'id' => 'expert-pool',
    'name' => 'Expert Pool',
    'category' => 'team',           // starter|team|domain|workflow|advanced
    'description' => '전문 에이전트 자동 위임...',
    'diagram' => [...],             // React Flow nodes/edges
    'recommended_agents' => [...],
    'recommended_skills' => [...],
    'expected_scores' => [
        'context' => 75,
        'verification' => 60,
        'state' => 70,
        'tools' => 80,
        'human' => 65,
        'lifecycle' => 50,
    ],
    'team_size' => '2-6',
    'complexity' => 'medium',
]
```

### HarnessEvaluation (평가 결과 DTO)

```php
[
    'scores' => [
        'context' => ['score' => 82, 'details' => '...', 'suggestions' => [...]],
        'verification' => ['score' => 45, 'details' => '...', 'suggestions' => [...]],
        // ... 6축 모두
    ],
    'overall' => 68,
    'grade' => 'B',
    'top_priority' => 'verification',  // 가장 개선 효과 큰 축
    'token_budget' => [
        'fixed' => 22600,
        'available' => 233400,
        'utilization' => 0.088,
    ],
]
```

---

## 10. 단계별 구현 로드맵

### Phase 1: Foundation (v0.5) — 2주

**목표**: 하네스 개념 도입, 평가 기능 MVP

| # | 작업 | 담당 | 산출물 |
|---|---|---|---|
| 1.1 | PatternRegistry 구현 (7개 패턴 데이터) | BE | PatternRegistry.php |
| 1.2 | HarnessEvaluationService MVP (6축 점수 산출) | BE | Service + DTO + Controller |
| 1.3 | ContextBudgetCalculator (토큰 추정) | BE | Service + API |
| 1.4 | 평가 API + 패턴 API 엔드포인트 | BE | 5개 신규 API |
| 1.5 | 패턴 목록 페이지 | FE | /patterns 라우트 |
| 1.6 | 6축 평가 대시보드 (레이더 차트) | FE | EvaluationDashboard |
| 1.7 | Context Budget 바 차트 | FE | ContextBudgetVisualizer |
| 1.8 | 홈 대시보드 (새 IA 진입점) | FE | / 라우트 재설계 |

### Phase 2: Wizard & Patterns (v0.6) — 2주

**목표**: Harness Wizard 완성, 패턴 프리셋 적용

| # | 작업 | 담당 | 산출물 |
|---|---|---|---|
| 2.1 | HarnessWizard 5단계 구현 | FE | /create 라우트 |
| 2.2 | 패턴 프리셋 → Canvas 자동 배치 | FE | PatternTemplateLoader |
| 2.3 | HarnessRecommendationService (체인 추천) | BE | Service + API |
| 2.4 | 추가 Node 컴포넌트 5종 | FE | Hook, MCP, Memory, Permission, Settings |
| 2.5 | 추가 Edge 타입 3종 | FE | 트리거, 참조, 로드 |
| 2.6 | 패턴 상세 페이지 (다이어그램 + 설명) | FE | /patterns/:id |
| 2.7 | PropertyPanel 가이드 폼 개편 | FE | 6축 관점 안내 문구 |

### Phase 3: Learning & Import (v0.7) — 2주

**목표**: 학습 가이드, 외부 하네스 임포트

| # | 작업 | 담당 | 산출물 |
|---|---|---|---|
| 3.1 | 학습 가이드 페이지 (6축 설명, 튜토리얼) | FE | /learn 라우트 |
| 3.2 | .claude/ 업로드 → 분석 플로우 | FE+BE | /analyze |
| 3.3 | GitHub URL 임포트 | BE | GitHubImportService |
| 3.4 | 내보내기 리포트 (설계문서 + 평가) | FE+BE | HarnessExportReport |
| 3.5 | 도메인 특화 패턴 추가 (Laravel, React, Python) | BE | PatternRegistry 확장 |

### Phase 4: Polish & Launch (v1.0) — 2주

**목표**: 프로덕션 안정화, 커뮤니티 준비

| # | 작업 | 담당 | 산출물 |
|---|---|---|---|
| 4.1 | E2E 테스트 | FE+BE | Cypress + Pest |
| 4.2 | 성능 최적화 (캔버스 렌더링, API 응답) | FE+BE | - |
| 4.3 | 반응형 UI (태블릿 대응) | FE | - |
| 4.4 | 문서화 (README, 기여 가이드) | - | docs/ |
| 4.5 | 커뮤니티 패턴 제출 프로세스 설계 | - | CONTRIBUTING.md |

---

## 11. 프로젝트 메타 변경

### CLAUDE.md 업데이트 방향

```markdown
# claude-forge

> Harness Engineering Platform — AI 하네스를 설계하고 구축하고 평가하는 도구

## 제품 정의
claude-forge는 Claude Code 사용자가 자신의 작업 방식에 맞는 AI 하네스를
설계(Design), 구축(Build), 평가(Evaluate), 진화(Evolve)할 수 있는 웹 플랫폼이다.

## 핵심 개념: 6축 프레임워크
1. Context Engineering — 모델에 전달되는 정보의 질과 양
2. Verification Loops — 출력물의 자동 검증
3. State Management — 세션 간 학습과 기억
4. Tool Orchestration — 도구 호출의 최적 조합
5. Human-in-the-Loop — 위험 결정의 사람 개입
6. Lifecycle Management — 이벤트 기반 자동화
```

### 에이전트 업데이트

기존 4개 에이전트 유지, description만 하네스 플랫폼 맥락으로 수정.

### 새 스킬 후보

| 스킬 | 용도 |
|---|---|
| `/pattern {name}` | 패턴 템플릿 코드 자동 생성 |
| `/evaluate` | 현재 .claude/ 평가 실행 |
| `/budget` | Context Budget 계산 |

---

## 12. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| 토큰 추정 정확도 | Budget 시각화 신뢰성 저하 | 실제 Claude Code 세션 측정치 기반 보정 테이블 사용 |
| 패턴이 너무 추상적 | 사용자가 실무 적용 어려움 | 각 패턴에 구체적 파일 템플릿 + 실사용 예제 필수 포함 |
| 6축 평가 기준의 주관성 | 점수 신뢰성 의문 | 체크리스트 기반 이진 판정 항목 최대화, 주관 항목 최소화 |
| 기존 사용자 혼란 | .claude 빌더 찾던 사용자 이탈 | 홈에서 "바로 만들기" 경로 유지 (Wizard 스킵 가능) |
| 커뮤니티 패턴 품질 관리 | 저품질 패턴 유입 | 제출 시 자동 평가 점수 표시, 일정 기준 이하 비공개 |

---

## 13. 성공 지표

| 지표 | 현재 | 목표 (v1.0) |
|---|---|---|
| 내보내기 시 평균 6축 점수 | N/A | B등급 (60+) 이상 |
| Wizard 완료율 | N/A | 70%+ |
| 패턴 사용률 | N/A | 생성의 80%가 패턴 기반 |
| GitHub Stars | 0 | 500+ |
| 커뮤니티 패턴 제출 | 0 | 20+ |

---

## 부록: 참고 자료

| 자료 | 위치 |
|---|---|
| Agent Harness 발표 정리 | `docs/agent-harness-guide/README.md` |
| Agent Harness 평가 보고서 | `docs/agent-harness-guide/evaluation.md` |
| Claude Code 구성 요소 조사 | `docs/agent-config-elements/` (11개 문서) |
| React Flow + Markdown 리서치 | `docs/react-flow-markdown-research/` |
| 기존 PRD | `docs/PRD.md` |
