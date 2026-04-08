# PRD: claude-forge — Harness Engineering Platform

> 최종 수정: 2026-04-08 | 버전: v2.0 (피벗 반영)

## 1. 개요

### 제품명
claude-forge

### 한 줄 설명
AI 하네스를 설계하고, 구축하고, 평가하고, 진화시키는 Harness Engineering 플랫폼.

### 배경
2026년 상반기, Harness Engineering이 업계 표준 개념으로 부상했다. Anthropic, Martin Fowler, OpenAI 모두 공식 문서를 발행했으며, 개발자들이 겪는 진짜 어려움은 "파일 형식"이 아닌 "어떤 하네스를 어떻게 설계할지 모르는 것"이다.

### AS-IS → TO-BE

| | AS-IS | TO-BE |
|---|---|---|
| **정체성** | .claude 폴더 드래그앤드롭 빌더 | Harness Engineering 플랫폼 |
| **핵심 가치** | "설정 파일을 쉽게 만들자" | "내 작업 방식에 맞는 하네스를 설계하자" |
| **타겟 사용자** | Claude Code 초보자 | 초보자 ~ 중급자 |
| **최종 산출물** | .claude/ ZIP 다운로드 | 완성된 하네스 + 설계 문서 + 평가 리포트 |
| **차별점** | 파일 생성기 | 방법론 + 도구 + 평가의 통합 경험 |

## 2. 대상 사용자

### Primary
- Claude Code를 사용하지만 하네스 설계 방법을 모르는 개발자
- 프로젝트에 맞는 최적 에이전트 아키텍처를 찾는 팀

### Secondary
- 기존 .claude 설정을 분석하고 개선하려는 사용자
- Harness Engineering 개념을 학습하려는 개발자

## 3. 핵심 개념: 6축 프레임워크

| 축 | 설명 | Claude Code 매핑 |
|---|---|---|
| **Context Engineering** | 모델에 전달되는 정보의 질과 양 | CLAUDE.md, Rules, @참조, Agent frontmatter |
| **Verification Loops** | 출력물의 자동 검증 | Evaluator agent, Test runner, Coverage |
| **State Management** | 세션 간 학습과 기억 | Memory, agent-memory, CLAUDE.md 업데이트 |
| **Tool Orchestration** | 도구 호출의 최적 조합 | Agent tools[], Skills, MCP 서버 |
| **Human-in-the-Loop** | 위험 결정의 사람 개입 | Permission modes, approval gates |
| **Lifecycle Management** | 이벤트 기반 자동화 | Hooks, Settings |

## 4. 핵심 기능

### F1: Harness Wizard (5단계 설계 마법사)
1. 프로젝트 프로필 — 사용 언어, 프레임워크, 팀 규모, 목표
2. 작업 유형 선택 — 코딩, 리뷰, 테스트, 리서치, 문서화
3. 아키텍처 패턴 추천 — Solo / Pipeline / Fan-out / Expert Pool / ...
4. 6축 설계 — 축별 구성 요소 선택/커스터마이징
5. Context Budget 확인 — 256K 토큰 예산 시각화

### F2: Visual Harness Builder (캔버스)
- 8+ 노드 타입: Agent, Skill, Rule, Hook, MCP, Memory, Permission, Settings
- 4 엣지 타입: 위임(실선), 트리거(점선), 참조(대시선), 로드(굵은)
- 아키텍처 패턴 프리셋 드롭
- 가이드 폼 기반 속성 편집

### F3: Harness Evaluation (6축 평가)
- 각 축 0~100점 산출 (체크리스트 기반 이진 판정 + 가중치)
- 종합 등급: S(90+), A(75-89), B(60-74), C(40-59), D(0-39)
- 6축 레이더 차트 + 축별 개선 제안
- 벤치마크 비교

### F4: Pattern Library (아키텍처 패턴 카탈로그)
- 7개 기본 패턴: Solo, Pipeline, Fan-out/Fan-in, Expert Pool, Producer-Reviewer, Supervisor, 3-Agent
- 5개 카테고리: 스타터, 팀 표준, 도메인 특화, 워크플로우, 고급
- 각 패턴: 다이어그램 + 파일 목록 + 기대 점수 + "이 패턴으로 시작" 버튼

### F5: Context Budget Visualizer
- 256K 토큰 기준 스택 바 차트
- 항목별 색상 구분: System Prompt, Tools, CLAUDE.md, Rules, Agents, Memory
- 에이전트/룰 추가 시 실시간 업데이트

### F6: Import & Analyze
- .claude/ ZIP 업로드 → 6축 평가 → 개선 제안
- GitHub URL → .claude/ 자동 추출 → 분석
- 내보내기: .claude/ ZIP + 설계 문서(MD) + 평가 리포트(MD)

## 5. 제품 형태

| 항목 | 내용 |
|------|------|
| 배포 방식 | 오픈소스 (GitHub) |
| 실행 방식 | Docker (`docker compose up`) |
| 접속 방식 | localhost 웹 UI |
| 플랫폼 | PC 전용 (태블릿 읽기 전용) |
| AI 엔진 | 로컬 Claude Code CLI |

## 6. 기술 스택

| 항목 | 기술 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + React Flow 12 + Tailwind CSS 4 |
| 백엔드 | PHP 8.4 + Laravel 13 |
| DB | PostgreSQL 18 |
| 인프라 | Docker Compose |
| 테스트 | Pest (BE) + Vitest (FE) |

## 7. 정보 아키텍처

```
홈 (대시보드)
├── /create             → Harness Wizard (5 steps)
│   └── /create/builder → Canvas Builder
├── /analyze            → 기존 하네스 분석
├── /patterns           → 패턴 라이브러리
│   └── /patterns/:id   → 패턴 상세
├── /learn              → 학습 가이드
│   └── /learn/:topic   → 주제별 가이드
└── 설정
```

## 8. API 설계

### 기존 유지
- `GET /api/v1/health` — 헬스 체크
- `GET /api/v1/stacks` — 기술 스택 목록
- `POST /api/v1/recommendations` — 추천 생성
- `GET /api/v1/rules-db` — 규칙 DB
- `POST /api/v1/cli/scan` — CLI 스캔
- `POST /api/v1/cli/apply` — CLI 적용
- `POST /api/v1/cli/validate` — CLI 검증

### 신규
- `GET /api/v1/patterns` — 패턴 목록
- `GET /api/v1/patterns/{id}` — 패턴 상세
- `POST /api/v1/harness/evaluate` — 6축 평가
- `POST /api/v1/harness/context-budget` — 토큰 예산 계산
- `POST /api/v1/harness/recommend` — 하네스 추천

## 9. 릴리스 로드맵

| 버전 | 범위 | 핵심 |
|------|------|------|
| v0.5 | Foundation | 6축 평가 + Context Budget + 패턴 카탈로그 |
| v0.6 | Wizard & Patterns | 5단계 위자드 + 패턴 프리셋 + 캔버스 확장 |
| v0.7 | Learning & Import | 학습 가이드 + .claude/ 업로드 + GitHub 임포트 |
| v1.0 | Polish & Launch | E2E 테스트 + 성능 최적화 + 커뮤니티 |

## 10. 성공 지표

| 지표 | 목표 (v1.0) |
|------|-------------|
| 내보내기 시 평균 6축 점수 | B등급 (60+) 이상 |
| Wizard 완료율 | 70%+ |
| 패턴 사용률 | 생성의 80%가 패턴 기반 |
| GitHub Stars | 500+ |
| 커뮤니티 패턴 제출 | 20+ |
