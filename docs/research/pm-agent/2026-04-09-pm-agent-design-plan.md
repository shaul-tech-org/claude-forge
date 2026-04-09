# PM Agent 구성 계획

> 조사일: 2026-04-09
> 카테고리: official-docs
> 태그: pm-agent, claude-code, sub-agent, plane-mcp, design-plan

## 요약

claude-forge에 PM agent를 추가하는 구체적 설계 계획. Claude Code sub-agent(`.claude/agents/pm-agent.md`)와 사용자 진입점 스킬(`.claude/skills/pm/SKILL.md`)을 조합하고 Plane MCP 서버를 연동하여 이슈 분해·스프린트 관리·블로커 감지 기능을 구현한다. 기존 plane-\* 스킬은 유지하면서 PM agent에 흡수한다.

## 조사 배경

[배경 조사 문서](2026-04-09-pm-agent-background.md)를 바탕으로 claude-forge에 PM agent를 실제로 추가하기 위한 구체적 설계를 정리한다.

---

## 1. 아키텍처 설계

### 역할 정의

```
사용자
  ├── coordinator — 구현 요청 접수 + be/fe/infra/research 라우팅
  └── pm-agent (신규) — 프로젝트 관리 전담
        ├── Plane MCP (이슈/사이클 CRUD)
        ├── plane-issues skill (이슈 조회 보조)
        ├── plane-start skill (작업 시작 보조)
        └── plane-done skill (작업 완료 보조)
```

### Coordinator와의 역할 경계

| 업무 | coordinator | pm-agent |
|------|:-----------:|:--------:|
| 구현 요청 → be/fe/infra 라우팅 | O | |
| 이슈/스프린트 생성 및 관리 | | O |
| 작업 분해 (큰 요청 → sub-issues) | | O |
| 진행 상황 보고 | | O |
| 블로커/리스크 감지 | | O |
| 릴리즈 계획 수립 | | O |
| 직접 구현 (코드 작성 등) | | |

---

## 2. 파일 구조

```
.claude/
├── agents/
│   └── pm-agent.md              # Sub-agent 정의
├── skills/
│   ├── pm/
│   │   └── SKILL.md             # /pm 사용자 진입점 스킬
│   ├── pm-sprint/
│   │   └── SKILL.md             # /pm-sprint 스프린트 계획 스킬
│   ├── pm-breakdown/
│   │   └── SKILL.md             # /pm-breakdown 이슈 분해 스킬
│   ├── pm-status/
│   │   └── SKILL.md             # /pm-status 진행 상황 보고 스킬
│   ├── plane-issues/            # 기존 유지
│   ├── plane-start/             # 기존 유지
│   └── plane-done/              # 기존 유지
└── rules/
    └── governance/
        └── org-chart.md         # pm-agent 추가 필요
```

---

## 3. Sub-agent 정의 (`.claude/agents/pm-agent.md`)

```markdown
---
name: pm-agent
description: >
  프로젝트 관리 요청을 처리한다. 다음 상황에서 호출한다:
  이슈 생성, 이슈 분해(큰 기능을 sub-issue로 분해), 스프린트/사이클 계획,
  진행 상황 보고, 블로커 감지, 릴리즈 계획, 작업 우선순위 결정.
  구현 작업(코드 작성)은 담당하지 않는다.
model: sonnet
tools: Bash, Read, Glob, Grep
mcpServers:
  - plane:
      type: stdio
      command: uvx
      args: ["plane-mcp-server", "stdio"]
      env:
        PLANE_API_KEY: "${PLANE_API_KEY}"
        PLANE_WORKSPACE_SLUG: "shaul-org"
        PLANE_BASE_URL: "https://plane.shaul.kr"
memory: project
skills:
  - plane-issues
  - plane-start
  - plane-done
---

# PM Agent

claude-forge 프로젝트의 프로젝트 관리를 담당한다.
...
```

---

## 4. 스킬 설계

### 4.1 `/pm` — 메인 진입점 스킬

```yaml
---
name: pm
description: >
  PM(Project Manager) agent에게 프로젝트 관리 작업을 위임한다.
  이슈 관리, 스프린트 계획, 진행 상황 확인, 블로커 분석 등.
argument-hint: "[작업 내용 또는 명령]"
context: fork
agent: pm-agent
disable-model-invocation: true
---
```

### 4.2 `/pm-sprint` — 스프린트 계획

기능: 백로그 이슈를 조회하고 우선순위에 따라 스프린트(Cycle) 구성을 제안한다.

핵심 절차:
1. Plane MCP로 현재 백로그 이슈 목록 조회
2. 우선순위, 의존성, 크기 분석
3. 스프린트 구성안 제안 (이슈 목록 + 예상 기간)
4. 사용자 승인 후 Plane에서 Cycle 생성 및 이슈 할당

### 4.3 `/pm-breakdown` — 이슈 분해

기능: 큰 요청이나 이슈를 실행 가능한 sub-issue로 분해한다.

입력: 자연어 요청 또는 FORGE-{번호}
출력: sub-issue 목록 (제목, 담당 에이전트 역할, 우선순위, 의존성)

핵심 절차:
1. 요청 내용 분석
2. 필요한 작업 단위 식별 (be/fe/infra/research별 분리)
3. 의존성 그래프 작성
4. Plane에 parent issue + sub-issues 생성

### 4.4 `/pm-status` — 진행 상황 보고

기능: 현재 스프린트 진행 상황을 종합 보고한다.

핵심 절차:
1. In Progress + Done 이슈 조회
2. 블로킹 이슈 (오래된 In Progress) 감지
3. 스프린트 완료율 계산
4. 요약 보고서 출력

---

## 5. Plane MCP 서버 연동 설정

### 전역 설정 (`.mcp.json`)

PM agent 외에도 다른 에이전트/스킬에서 Plane에 접근해야 하는 경우 전역 등록:

```json
{
  "mcpServers": {
    "plane": {
      "type": "stdio",
      "command": "uvx",
      "args": ["plane-mcp-server", "stdio"],
      "env": {
        "PLANE_API_KEY": "${PLANE_API_KEY}",
        "PLANE_WORKSPACE_SLUG": "shaul-org",
        "PLANE_BASE_URL": "https://plane.shaul.kr"
      }
    }
  }
}
```

### PM agent 전용 설정

컨텍스트 절약이 중요하다면 PM agent frontmatter의 `mcpServers`에만 inline 정의하고 `.mcp.json`에는 등록하지 않는다. MCP 서버 도구 설명이 parent conversation의 컨텍스트를 차지하지 않는다.

**권장**: self-hosted Plane 접근에 API key가 필요하므로 `.mcp.json`에 전역 등록하되 `.env`에서 환경변수로 관리한다.

---

## 6. 기존 plane-\* 스킬과의 관계

기존 `plane-issues`, `plane-start`, `plane-done` 스킬은 다음과 같이 유지한다:

| 스킬 | 유지 여부 | 이유 |
|------|:---------:|------|
| `/plane-issues` | O | 사용자가 직접 빠르게 이슈 목록 확인용 |
| `/plane-start` | O | 개별 이슈 작업 시작 시 브랜치 생성 포함 |
| `/plane-done` | O | 개별 이슈 완료 처리 |

PM agent는 이 스킬들을 `skills` frontmatter로 내부적으로 활용한다. Plane MCP 서버가 이미 이 기능을 포괄하지만, 기존 스킬은 더 claude-forge 프로젝트에 특화된 절차(브랜치 생성, 특정 상태 ID 등)를 포함하므로 보완적으로 유지한다.

---

## 7. CLAUDE.md 및 org-chart 갱신 필요 항목

### CLAUDE.md 에이전트 테이블 추가

```markdown
| pm-agent | sonnet | 이슈 분해, 스프린트 관리, 진행 상황 추적, 릴리즈 계획 |
```

### CLAUDE.md 스킬 테이블 추가

```markdown
| PM 관리 | `/pm`, `/pm-sprint`, `/pm-breakdown`, `/pm-status` |
```

### org-chart.md 갱신

```
사용자
  └── Coordinator (sonnet) — 모든 요청 접수 + 라우팅
        ├── pm-agent (sonnet) — 이슈 분해/스프린트/릴리즈 계획
        ├── be-developer (sonnet) — PHP/Laravel 백엔드
        ├── fe-developer (sonnet) — React/TypeScript 프론트엔드
        ├── infra-engineer (sonnet) — Docker, CI/CD
        └── research (sonnet) — 기술 조사/문서화
```

---

## 8. 구현 우선순위

### Phase 1 — 기반 (필수)

1. Plane MCP 서버 설치 및 `.mcp.json` 설정
2. `.claude/agents/pm-agent.md` 작성 (기본 역할 정의 + Plane MCP 연동)
3. `/pm` 스킬 추가 (메인 진입점)
4. `/pm-status` 스킬 추가 (현재 스프린트 상황 조회 — 가장 자주 사용)

### Phase 2 — 핵심 기능

5. `/pm-breakdown` 스킬 추가 (이슈 분해)
6. `/pm-sprint` 스킬 추가 (스프린트 계획)
7. CLAUDE.md, org-chart.md 갱신

### Phase 3 — 고도화 (선택)

8. PM agent memory 활용 (스프린트 속도 추적)
9. 릴리즈 계획 기능
10. coordinator와의 자동 연동 (큰 요청 시 PM agent가 먼저 분해 후 coordinator에 전달)

---

## 9. 리스크 및 고려사항

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Plane MCP 서버 self-hosted 호환성 | 중 | `PLANE_BASE_URL` 환경변수로 자체 서버 지정. 공식 서버는 `https://api.plane.so`이나 self-hosted는 다를 수 있음 |
| uvx 미설치 환경 | 중 | uv 설치 안내 또는 npx 기반 이전 버전 대안 제공 |
| PM agent와 coordinator 역할 중복 | 낮 | org-chart.md에 역할 경계 명확히 정의 |
| 컨텍스트 비용 (MCP 도구 55+개) | 중 | PM agent 전용 scope으로 MCP 설정, parent conversation 컨텍스트 절약 |
| plane-\* 스킬 중복 | 낮 | 기존 스킬은 유지, PM agent는 MCP 우선 사용하되 특화 절차에만 기존 스킬 참조 |

---

## 10. 권장 사항

1. **Plane MCP를 PM agent 전용 scope으로 먼저 도입한다**: `.mcp.json` 전역 등록보다 pm-agent.md의 `mcpServers` inline 정의로 시작하여 컨텍스트 비용을 평가한 후 전역 여부를 결정한다.

2. **PM agent는 sub-agent로 구현한다**: 사용자가 `/pm` 스킬로 직접 호출하거나 coordinator가 프로젝트 관리 요청 시 자동 위임하는 두 경로를 모두 지원한다.

3. **기존 curl 기반 plane-\* 스킬은 유지한다**: Plane MCP가 더 강력하지만, 기존 스킬은 프로젝트 특화 절차(상태 ID, 브랜치 규칙)를 담고 있어 보완적 가치가 있다.

4. **Human-in-the-Loop를 기본으로 한다**: PM agent가 스프린트 계획이나 이슈 분해 결과를 제안하고, 사용자가 승인한 후 Plane에 반영하는 패턴을 기본으로 한다.

5. **`/pm-status`를 첫 번째로 구현한다**: 즉시 가치를 제공하면서 구현이 단순하고 Plane MCP 연동 검증에도 유용하다.

---

## 참고 자료

- [PM Agent 배경 조사](2026-04-09-pm-agent-background.md)
- [Claude Code Sub-agents 공식 문서](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Skills 공식 문서](https://code.claude.com/docs/en/skills)
- [Plane MCP Server](https://github.com/makeplane/plane-mcp-server)
- [Plane MCP 공식 개발자 문서](https://developers.plane.so/dev-tools/mcp-server)
- [Plane Cycles API](https://developers.plane.so/api-reference/cycle/overview)
