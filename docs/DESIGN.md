# UI/UX 설계 가이드

## 캔버스 노드 시스템

### 노드 타입 (8종)

| 타입 | 아이콘 | 색상 계열 | 용도 |
|------|--------|----------|------|
| **Agent** | 사람 | Purple | 에이전트 정의 (name, model, description, instructions) |
| **Skill** | 번개 | Blue | 실행 스킬 (trigger, args, userInvocable) |
| **Rule** | 문서 | Green | 코딩 규칙 (category, paths, content) |
| **Hook** | 고리 | Orange | 이벤트 핸들러 (event, command) |
| **MCP** | 플러그 | Cyan | 외부 도구 서버 (serverUrl, tools) |
| **Memory** | 뇌 | Pink | 상태 저장소 (memoryType) |
| **Permission** | 자물쇠 | Red | 접근 제어 (mode, allowedTools) |
| **Settings** | 기어 | Gray | 프로젝트 설정 (key, value) |

### 엣지 타입 (6종)

| 타입 | 스타일 | 연결 | 의미 |
|------|--------|------|------|
| **Delegation** | 실선, 화살표 | Agent → Agent | 작업 위임 |
| **Uses** | 점선, 화살표 | Agent → Skill | 스킬 사용 |
| **Applies** | 점선, 화살표 | Agent → Rule | 규칙 적용 |
| **Trigger** | 파선, 화살표 | Agent → Hook | 훅 트리거 |
| **Reference** | 얇은 실선 | Agent → Memory/Permission/Settings | 참조 |
| **Load** | 굵은 실선 | * → MCP | MCP 서버 로드 |

### 엣지 유효성 규칙

- **Agent만 source 가능** (다른 노드에서 출발하는 엣지 불가)
- Agent → Agent: `delegation`
- Agent → Skill: `uses`
- Agent → Rule: `applies`
- 자기 자신 연결 불가

## 6축 시각화

### 색상 체계

| 축 | 색상 | Hex | 용도 |
|---|------|-----|------|
| Context | 보라 | `#8B5CF6` | 레이더 차트, 배지 |
| Verification | 파랑 | `#3B82F6` | 레이더 차트, 배지 |
| State | 초록 | `#10B981` | 레이더 차트, 배지 |
| Tools | 주황 | `#F59E0B` | 레이더 차트, 배지 |
| Human | 빨강 | `#EF4444` | 레이더 차트, 배지 |
| Lifecycle | 청록 | `#06B6D4` | 레이더 차트, 배지 |

### 등급 배지

| 등급 | 점수 범위 | 색상 |
|------|----------|------|
| S | 90-100 | Gold |
| A | 80-89 | Green |
| B | 70-79 | Blue |
| C | 60-69 | Orange |
| D | 0-59 | Red |

## 페이지별 레이아웃

### 홈 (/)

카드 그리드 — 5개 진입점 (New Harness, Analyze, Patterns, Learn, Canvas)

### 마법사 (/create)

스텝 진행 바 — 5단계 세로 레이아웃

### 캔버스 (/create/builder)

```
┌────────────────────────────────────────┐
│ Toolbar (상단)                          │
├────────┬──────────────────────┬────────┤
│ Drag   │                      │Property│
│ Panel  │    React Flow Canvas │ Panel  │
│ (좌)   │                      │ (우)   │
├────────┴──────────────────────┴────────┤
│ Config Tabs (하단): CLAUDE.md | Settings│
└────────────────────────────────────────┘
```

### 분석 (/analyze)

드롭존 → 결과: 등급 배지 + 레이더 차트 + 축별 상세

## 디자인 스킬 체계

11개 전문 디자인 스킬이 프론트엔드 품질을 관리합니다:

| 스킬 | 역할 |
|------|------|
| `/frontend-design` | 메인 설계 (모든 설계 작업의 기초) |
| `/audit` | 접근성, 성능, 테마, 반응형 감사 |
| `/critique` | UX 관점 평가 (스코어링, 페르소나 검증) |
| `/polish` | 최종 품질 패스 (정렬, 간격, 일관성) |
| `/normalize` | 디자인 시스템 기준 정렬 |
| `/adapt` | 반응형 적응 |
| `/animate` | 애니메이션/마이크로인터랙션 |
| `/arrange` | 레이아웃/공간 개선 |
| `/colorize` | 색상 전략 |
| `/distill` | 단순화/복잡도 제거 |
| `/typeset` | 타이포그래피 개선 |

레퍼런스 문서: `.claude/skills/frontend-design/reference/` (7개)
