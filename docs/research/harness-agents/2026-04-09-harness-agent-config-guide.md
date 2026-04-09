# claude-forge 하네스 에이전트 구성 가이드

> 작성일: 2026-04-09
> 근거 자료: 종합 조사 보고서, 테디노트 발표 정리, PM agent 설계 계획
> 태그: harness, agent-config, context-optimization, best-practices

---

## 1. 현재 상태 (AS-IS)

### 에이전트 구성

| 에이전트 | model | color | effort | memory | tools | maxTurns |
|---------|-------|-------|--------|--------|-------|----------|
| coordinator | sonnet | purple | medium | - | 제한 없음 | - |
| be-developer | sonnet | green | high | - | 제한 없음 | - |
| fe-developer | sonnet | cyan | high | - | 제한 없음 | - |
| infra-engineer | sonnet | orange | high | - | 제한 없음 | - |
| research | sonnet | blue | high | - | 제한 없음 | - |

### 진단된 문제

| # | 문제 | 근거 |
|---|------|------|
| 1 | **memory 미설정** — 에이전트가 세션 간 학습을 누적하지 못함 | 종합 조사: memory 설정 시 에이전트별 persistent 디렉토리 생성 |
| 2 | **tools 무제한** — 모든 에이전트가 모든 도구에 접근 가능 | 테디노트: allowedTools로 안전하게 제한. 종합 조사: 최소 권한 원칙 |
| 3 | **coordinator의 Agent 스폰 미제한** — 어떤 에이전트든 스폰 가능 | 종합 조사: `Agent(worker, researcher)` 형태로 제한 권장 |
| 4 | **description 트리거 부족** — 자동 라우팅 정확도 미최적화 | 종합 조사: "proactively", "use when" 등 트리거 키워드 필요 |
| 5 | **maxTurns 미설정** — 에이전트 실행 비용 제어 불가 | 종합 조사: 읽기 전용 5-10, 구현 20-50, 디버깅 30-60 |
| 6 | **PM 레이어 부재** — 이슈 분해, 스프린트 관리 담당 에이전트 없음 | PM agent 조사: Planning Layer와 Control Layer 분리 필요 |
| 7 | **hooks 미활용** — 자동 품질 게이트 없음 | 테디노트: Hooks는 나만의 Harness를 만들기 위해 필수 |
| 8 | **Command 절차 부족** — 스킬에서 에이전트 위임 시 구체적 절차 불충분 | 테디노트: Sub-agent는 Plan 모드 없음, Command에 단계별 절차 명시 필요 |

---

## 2. 설계 원칙

조사 자료에서 도출한 핵심 원칙:

### 2.1 컨텍스트 예산 관리

> "최대한 256K 안쪽으로 사용하도록!" — 테디노트

- 에이전트 Frontmatter는 **항상** parent context에 로드됨
- 에이전트 수 × description 길이 = 고정 컨텍스트 비용
- **5-7개 에이전트**가 적정 (현재 5개 → pm-agent 추가 시 6개)
- 너무 세분화하면 위임 모호성 증가 + 컨텍스트 낭비

### 2.2 역할 분리 — 3 Layer

```
사용자
  ├── Planning Layer: pm-agent — 이슈 분해, 스프린트 관리
  └── Control Layer: coordinator — 구현 요청 라우팅
        ├── Execution Layer: be-developer
        ├── Execution Layer: fe-developer
        ├── Execution Layer: infra-engineer
        └── Execution Layer: research
```

- **Planning** (pm-agent): "무엇을 어떤 순서로 해야 하는가"
- **Control** (coordinator): "어떤 에이전트에게 위임할 것인가"
- **Execution** (be/fe/infra/research): "실제 구현"

### 2.3 description이 라우팅의 전부

> "Claude가 이 텍스트를 기반으로 언제 위임할지 결정한다" — 공식 문서

좋은 description 작성 규칙:
1. **명확한 트리거 조건**: "Use when ...", "Use proactively after ..."
2. **도메인 명시**: 어떤 분야의 전문가인지
3. **부정 케이스**: 사용하지 말아야 하는 상황도 포함
4. **영어로 작성**: Claude의 라우팅 판단은 영어가 더 정확

### 2.4 Command에 단계별 절차 명시

> "Sub-agent는 Plan 모드가 없다. Command에 단계별 절차를 써줘야 올바른 순서로 실행" — 테디노트

- Sub-agent는 parent context를 모른다
- 유일한 전달 채널은 Agent tool의 prompt string
- 스킬(SKILL.md)에 절차를 구체적으로 명시 → 에이전트가 일관되게 실행

### 2.5 최소 권한 (Least Privilege)

- 읽기 전용 에이전트: `tools: Read, Grep, Glob`
- 구현 에이전트: `tools: Read, Edit, Write, Bash, Grep, Glob`
- coordinator: `tools: Agent(be-developer, fe-developer, infra-engineer, research, pm-agent), Read`
- `disallowedTools`로 위험 도구 차단 가능

---

## 3. 목표 상태 (TO-BE) — 에이전트별 설계

### 3.1 coordinator

```yaml
---
name: coordinator
description: >
  Harness Engineering Platform request router.
  Use when: multi-domain tasks requiring work decomposition,
  fullstack features spanning backend and frontend,
  or unclear requests needing analysis before delegation.
  Do NOT use for: single-domain tasks (use domain agents directly).
model: sonnet
color: purple
effort: medium
tools: Agent(be-developer, fe-developer, infra-engineer, research, pm-agent), Read, Glob, Grep
maxTurns: 15
---
```

**변경 사항**:
- `description`: 영어 + 트리거 키워드 추가
- `tools`: Agent 스폰을 5개 에이전트로 제한 + 읽기 도구만 허용
- `maxTurns: 15`: 라우팅은 많은 턴이 불필요

### 3.2 be-developer

```yaml
---
name: be-developer
description: >
  PHP 8.4 + Laravel 13 backend developer.
  Use when: implementing API endpoints, database migrations,
  Eloquent models, service layer, server-side business logic,
  or running backend tests (Pest/PHPUnit).
model: sonnet
color: green
effort: high
memory: project
tools: Read, Edit, Write, Bash, Grep, Glob
maxTurns: 40
---
```

**변경 사항**:
- `description`: 영어 + 구체적 트리거 조건
- `memory: project`: `.claude/agent-memory/be-developer/`에 학습 누적
- `tools`: 구현에 필요한 도구만 명시 (Agent 스폰 불가)
- `maxTurns: 40`: 구현 에이전트 적정 범위

### 3.3 fe-developer

```yaml
---
name: fe-developer
description: >
  React 19 + TypeScript + React Flow 12 + Tailwind CSS 4 frontend developer.
  Use when: building UI components, React Flow canvas interactions,
  dashboard pages, form wizards, or running frontend tests (Vitest).
model: sonnet
color: cyan
effort: high
memory: project
tools: Read, Edit, Write, Bash, Grep, Glob
maxTurns: 40
---
```

### 3.4 infra-engineer

```yaml
---
name: infra-engineer
description: >
  Infrastructure engineer for Docker Compose, CI/CD, and deployment.
  Use when: modifying Dockerfiles, docker-compose configs,
  GitHub Actions workflows, or environment setup.
model: sonnet
color: orange
effort: high
memory: project
tools: Read, Edit, Write, Bash, Grep, Glob
maxTurns: 30
---
```

### 3.5 research

```yaml
---
name: research
description: >
  Technical research agent. Investigates papers, official docs,
  open-source projects, and web articles. Outputs structured
  documents to docs/research/. Use when: technology comparison,
  architecture investigation, or background research is needed.
model: sonnet
color: blue
effort: high
memory: project
tools: Read, Write, Bash, Grep, Glob, WebSearch, WebFetch
maxTurns: 50
---
```

**변경 사항**:
- `tools`: Edit 제거 (문서 신규 작성이 주 업무), WebSearch/WebFetch 명시
- `maxTurns: 50`: 조사 작업은 많은 탐색이 필요

### 3.6 pm-agent (신규)

```yaml
---
name: pm-agent
description: >
  Project manager agent for Plane issue tracking.
  Use when: creating/decomposing issues, sprint planning,
  progress reporting, blocker detection, or release planning.
  Does NOT write code — manages issues and plans only.
model: sonnet
color: yellow
memory: project
tools: Read, Bash, Grep, Glob
maxTurns: 25
skills:
  - plane-issues
  - plane-start
  - plane-done
---
```

**Phase 2에서 Plane MCP 추가 시**:

```yaml
mcpServers:
  - plane:
      type: stdio
      command: uvx
      args: ["plane-mcp-server", "stdio"]
      env:
        PLANE_API_KEY: "${PLANE_API_KEY}"
        PLANE_WORKSPACE_SLUG: "shaul-org"
        PLANE_BASE_URL: "https://plane.shaul.kr"
```

---

## 4. 컨텍스트 예산 예측

### 현재 (AS-IS)

| 항목 | 토큰 |
|------|------|
| 에이전트 5개 frontmatter | ~300 |
| CLAUDE.md | ~500 (최적화 후) |
| rules (common + governance) | ~350 |
| MEMORY.md | ~150 |
| **합계 (고정)** | **~1,300** |

### 목표 (TO-BE)

| 항목 | 토큰 | 변화 |
|------|------|------|
| 에이전트 6개 frontmatter (description 확장) | ~600 | +300 |
| CLAUDE.md | ~500 | 0 |
| rules | ~350 | 0 |
| MEMORY.md | ~150 | 0 |
| **합계 (고정)** | **~1,600** | +300 |

300 토큰 증가는 description 최적화 + pm-agent 추가에 의한 것이며, 1M 컨텍스트의 0.03%에 불과하다. 라우팅 정확도 향상과 memory 활용 이점이 이를 상쇄한다.

---

## 5. Memory 전략

### 에이전트별 memory 디렉토리 구조

```
.claude/agent-memory/
├── be-developer/
│   ├── MEMORY.md        # 자동 로드 (200줄)
│   ├── laravel-patterns.md
│   └── api-conventions.md
├── fe-developer/
│   ├── MEMORY.md
│   ├── component-patterns.md
│   └── react-flow-tips.md
├── infra-engineer/
│   ├── MEMORY.md
│   └── docker-configs.md
├── research/
│   ├── MEMORY.md
│   └── search-strategies.md
└── pm-agent/
    ├── MEMORY.md
    └── sprint-velocity.md
```

### memory body에 학습 지시 추가

각 에이전트의 Markdown body에 다음을 추가:

```markdown
## Memory 관리

작업 중 발견한 다음 정보를 agent memory에 기록한다:
- 코드 패턴 및 컨벤션
- 자주 사용하는 파일 경로
- 반복되는 실수와 해결 방법
- 아키텍처 결정 사항
```

---

## 6. Hooks 전략 (Phase 2)

### 6.1 SubagentStop — 구현 에이전트 검증

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "matcher": "be-developer",
        "hooks": [
          {
            "type": "command",
            "command": "cd backend && ./vendor/bin/pint --test 2>&1 | tail -5"
          }
        ]
      },
      {
        "matcher": "fe-developer",
        "hooks": [
          {
            "type": "command",
            "command": "cd frontend && npx tsc --noEmit 2>&1 | tail -5"
          }
        ]
      }
    ]
  }
}
```

### 6.2 PreToolUse — 위험 명령 차단

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/block-dangerous-commands.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 7. 구현 로드맵

### Phase 1 — 즉시 적용 (에이전트 개선)

| # | 작업 | 영향 |
|---|------|------|
| 1 | 모든 에이전트 `description` 영어 + 트리거 키워드로 교체 | 라우팅 정확도 향상 |
| 2 | 모든 에이전트 `memory: project` 추가 | 세션 간 학습 누적 |
| 3 | 모든 에이전트 `tools` 명시 (최소 권한) | 안전성 향상 |
| 4 | 모든 에이전트 `maxTurns` 설정 | 비용 제어 |
| 5 | coordinator `tools: Agent(...)` 제한 | 스폰 제어 |

### Phase 2 — PM agent 추가

| # | 작업 |
|---|------|
| 6 | `.claude/agents/pm-agent.md` 작성 |
| 7 | `/pm`, `/pm-status` 스킬 추가 |
| 8 | Plane MCP 서버 설정 |
| 9 | `org-chart.md` 갱신 |

### Phase 3 — 품질 자동화

| # | 작업 |
|---|------|
| 10 | SubagentStop hooks 추가 (lint/typecheck) |
| 11 | PreToolUse hooks 추가 (위험 명령 차단) |
| 12 | Brainstorming/Interview 스킬 도입 |

### Phase 4 — 고도화

| # | 작업 |
|---|------|
| 13 | agent-memory 누적 데이터 기반 에이전트 성능 분석 |
| 14 | `isolation: worktree` 적용 (리팩토링 에이전트) |
| 15 | Agent Teams 실험 (be + fe 동시 협력 구현) |

---

## 8. 안티패턴 체크리스트

적용 전 확인해야 할 안티패턴:

- [ ] 에이전트를 너무 세분화하지 않았는가? (Frontend, CSS, HTML, Next.js 분리 등)
- [ ] description이 모호하지 않은가? ("Reviews code" → 나쁜 예)
- [ ] coordinator가 직접 코드를 작성하도록 허용하지 않았는가?
- [ ] Sub-agent에 충분한 컨텍스트를 전달하는가? (Command에 절차 명시)
- [ ] CLAUDE.md가 200줄을 초과하지 않는가?
- [ ] 에이전트 수가 7개를 초과하지 않는가?
- [ ] 같은 파일을 여러 에이전트가 동시에 수정할 가능성은 없는가?

---

## 참고 자료

- [종합 조사 보고서](2026-04-09-harness-agents-comprehensive.md)
- [테디노트 발표 정리](2026-04-09-teddy-harness-talk.md)
- [PM Agent 설계 계획](../pm-agent/2026-04-09-pm-agent-design-plan.md)
- [PM Agent 배경 조사](../pm-agent/2026-04-09-pm-agent-background.md)
