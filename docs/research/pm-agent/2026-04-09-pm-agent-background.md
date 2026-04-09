# PM Agent 설계를 위한 배경 조사

> 조사일: 2026-04-09
> 카테고리: web, official-docs, opensource
> 태그: pm-agent, project-management, claude-code, plane, multi-agent, crewai, langgraph, autogen

## 요약

AI 기반 PM(Project Manager) agent는 이슈 분해, 스프린트 계획, 진행 상황 추적, 블로커 감지 역할을 담당하며 기존 coordinator와 역할을 명확히 분리할 수 있다. Plane은 공식 MCP 서버(55+ tools)를 제공하여 Claude Code와 직접 연동이 가능하다. CrewAI, LangGraph, AutoGen 등 주요 프레임워크 모두 계획(Planning) 레이어를 오케스트레이터와 분리하는 구조를 채택한다. Claude Code sub-agent는 `tools`, `mcpServers`, `skills`, `memory` 등 풍부한 frontmatter 설정을 지원하며 PM agent 구현에 충분한 기반을 제공한다.

## 조사 배경

claude-forge 프로젝트에서 coordinator agent는 현재 요청 접수와 라우팅만 담당한다. 프로젝트가 성장함에 따라 이슈 분해, 스프린트 관리, 릴리즈 계획, 블로커 감지 등 프로젝트 관리 업무를 전담하는 PM agent가 필요해졌다. 기존 Plane 관련 스킬(plane-issues, plane-start, plane-done)이 있지만 이를 통합하여 능동적으로 프로젝트를 관리하는 에이전트가 없는 상태이다.

---

## 1. 역할 분리: Coordinator vs PM Agent

### 현재 구조의 한계

현재 coordinator는 "라우팅만, 직접 구현 금지" 원칙을 따른다. 그러나 아래 PM 업무는 현재 어느 에이전트도 담당하지 않는다:

- 큰 요청을 sub-task로 분해하기
- 스프린트/사이클 계획 및 관리
- 작업 우선순위 결정
- 진행 상황 종합 보고
- 블로커 및 리스크 감지
- 릴리즈 계획 수립

### Multi-Agent 아키텍처에서의 역할 분리 원칙

조사한 문헌에서 공통적으로 등장하는 세 개의 레이어:

| 레이어 | 역할 | claude-forge 대응 |
|--------|------|-------------------|
| Planning Layer | 목표를 하위 태스크로 분해, 의존성 파악 | **PM agent (신규)** |
| Control Layer | 어떤 에이전트에게 위임할지 결정, 실행 순서 관리 | coordinator |
| Execution Layer | 실제 구현 작업 수행 | be/fe/infra/research |

핵심 원칙: "The orchestrator decides what needs to be done, which agents should handle it. The orchestrator doesn't execute tasks; it plans and routes." — coordinator는 이미 이 역할을 하고 있다.

PM agent는 더 높은 레벨의 계획(Planning) 레이어로, coordinator가 라우팅하기 전에 "무엇을 어떤 순서로 해야 하는가"를 결정하는 역할이다.

### 분리 후 관계

```
사용자
  └── coordinator — 요청 접수 + 라우팅
        ├── pm-agent — 이슈 분해, 스프린트 관리, 릴리즈 계획
        │     └── (Plane MCP를 통해 이슈 생성/관리)
        ├── be-developer — PHP/Laravel 구현
        ├── fe-developer — React/TypeScript 구현
        ├── infra-engineer — Docker/CI
        └── research — 기술 조사
```

혹은 PM agent가 coordinator와 동급으로 사용자가 직접 호출하는 구조:

```
사용자
  ├── coordinator — 구현 요청 라우팅
  └── pm-agent — 프로젝트 관리 요청 전담
```

---

## 2. 유사 프레임워크 분석

### CrewAI — AgentPlanner 패턴

CrewAI는 `planning=True` 설정으로 AgentPlanner를 활성화한다. Crew 전체 정보를 AgentPlanner에 전달하면 에이전트별로 단계적 계획(plan)을 생성하고 각 태스크 description에 주입한다.

**Hierarchical Process**: manager 에이전트가 태스크를 위임하고 결과를 검증한다. `manager_agent`로 커스텀 에이전트를 지정하거나 `manager_llm`으로 LLM을 지정할 수 있다.

**claude-forge 적용 인사이트**:
- Planning은 별도 에이전트(PM agent)가 담당하는 것이 바람직하다
- Manager agent는 작업 위임과 결과 검증을 함께 한다

### LangGraph — State Machine 기반 계획

LangGraph는 액션을 방향 그래프의 노드로 표현한다. 2025년 5월 GA 출시 후 400여 개 기업이 프로덕션에서 사용 중이다.

**AI Sprint Planner 사례**: LangGraph state machine + Vertex AI(Gemini)로 구현된 스프린트 계획 도구가 Jira/Asana 대체를 목표로 한다. Self-correcting agents with reflection loops로 계획 품질을 보장한다.

**claude-forge 적용 인사이트**:
- 반성(reflection) 루프: PM agent가 생성한 계획을 스스로 검토하는 패턴
- State machine으로 스프린트 상태 추적

### Microsoft AutoGen / AG2 — Planner + Groupchat

AutoGen v0.4(2025년 1월)는 AG2로 리브랜딩, 이후 Microsoft Agent Framework(2025년 10월)에 통합되었다.

**Microsoft Planner AI**: Multi-Agent Runtime Service(MARS) 위에서 동작하는 Project Manager agent가 목표를 실행 가능한 태스크로 분해하고 자동 실행까지 지원한다.

**Planner 에이전트 패턴**: Planner agent가 workflow 시작 시 한 번 high-level plan을 생성하고 GroupChatManager가 실행을 조율한다.

**claude-forge 적용 인사이트**:
- PM agent는 세션 시작 시 전체 계획을 수립하고 이후 단계별로 위임
- GroupChat 대신 coordinator가 실행 조율 담당

### Agentic Project Management (APM) Framework

오픈소스 프레임워크로 Claude Code에 최적화된 fork도 존재한다.

**2-Phase 구조**:
1. Setup Phase: Setup Agent가 전체 프로젝트를 phases/tasks/subtasks로 분해
2. Task Loop Phase: Manager Agent가 Implementation Agent에 할당하고 진행 로그 검토

**claude-mpm (Claude Multi-Agent Project Manager)**:
- PM agent가 47+ 전문 에이전트에 스마트 라우팅
- 세션 중단/재개 지원 (70%, 85%, 95% 토큰 임계값에서 자동 요약)
- 3-Tier Skills 해석 순서: bundled → user → project

**claude-forge 적용 인사이트**:
- PM agent의 메모리/컨텍스트 관리가 핵심 (긴 세션에서 진행 상황 추적)
- 진행 로그를 Plane 이슈 코멘트로 기록하는 패턴 유효

### OpenHands — 태스크 분해 SDK

OpenHands SDK의 태스크 분해 도구는 디렉토리 경계와 컴포넌트 의존성을 기반으로 독립적 태스크 구간을 자동 식별한다. 진행 상황을 추적하고 병렬 에이전트 워크플로우를 조율한다.

**Devin과의 차이**: Devin은 완전 자율 실행, OpenHands는 사람이 AI 결정을 감독하면서 협력한다. 80~90% 자동화 + 사람 체크포인트가 100% 자동화보다 실용적이다.

**claude-forge 적용 인사이트**:
- Human-in-the-Loop: PM agent가 계획을 수립하고 사용자 승인 후 실행

---

## 3. Claude Code Sub-agent 구현 기반

Claude Code는 `.claude/agents/` 아래 마크다운 파일로 sub-agent를 정의한다.

### Frontmatter 주요 필드

| 필드 | 설명 | PM agent 활용 |
|------|------|---------------|
| `name` | 에이전트 식별자 | `pm-agent` |
| `description` | 위임 트리거 조건 | 이슈 관리, 스프린트 계획 관련 요청 시 자동 라우팅 |
| `tools` | 허용 도구 목록 | `Agent(be-developer, fe-developer, infra, research), Bash, Read` |
| `mcpServers` | MCP 서버 연결 | Plane MCP 서버 인라인 정의 |
| `memory` | 영속 메모리 범위 | `project` — 스프린트 상태 추적 |
| `skills` | 시작 시 로드할 스킬 | plane-issues, plane-start, plane-done |
| `model` | 사용 모델 | `sonnet` |
| `maxTurns` | 최대 턴 수 | 복잡한 계획 작업을 위해 충분히 설정 |

### 에이전트 파일 구조 예시

```yaml
---
name: pm-agent
description: >
  프로젝트 관리 요청을 처리한다. 이슈 생성, 스프린트 계획, 작업 분해,
  진행 상황 보고, 릴리즈 계획, 블로커 감지가 필요할 때 호출한다.
model: sonnet
tools: Agent(be-developer, fe-developer, infra-engineer, research), Bash, Read, Glob
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
```

### Sub-agent와 Skills의 관계

Claude Code에서 sub-agent는 `skills` 필드로 스킬을 시작 시 미리 로드할 수 있다 (parent conversation의 스킬은 상속하지 않음). 이를 통해 PM agent는 항상 Plane 관련 스킬을 사용할 수 있다.

### Agent Tool과 Sub-agent 구분

- **Sub-agent**: 특정 요청을 처리하는 독립 컨텍스트 창. Parent에서 위임받아 독립 실행 후 결과 반환
- **Agent Teams**: 여러 에이전트가 병렬로 통신하며 협업 (별도 세션)
- PM agent를 sub-agent로 구현하면 coordinator가 Agent tool로 위임 가능

---

## 4. Plane MCP 서버 분석

### 공식 Plane MCP 서버

GitHub: [makeplane/plane-mcp-server](https://github.com/makeplane/plane-mcp-server)

Node.js 버전에서 Python + FastMCP 기반으로 재구현. 55+ 도구를 8개 카테고리로 제공:

| 카테고리 | 주요 기능 |
|----------|-----------|
| Projects | 생성/조회/수정 |
| Work Items | CRUD, 검색 |
| Cycles | 스프린트 관리, 이슈 할당 |
| Modules | 모듈 구성 및 추적 |
| Initiatives | 워크스페이스 수준 계획 |
| Intake Items | 트리아지 워크플로우 |
| Work Item Properties | 커스텀 필드 |
| User Information | 사용자 조회 |

### 설치 방법 (Claude Code에서)

```json
{
  "mcpServers": {
    "plane": {
      "command": "uvx",
      "args": ["plane-mcp-server", "stdio"],
      "env": {
        "PLANE_API_KEY": "<your-api-key>",
        "PLANE_WORKSPACE_SLUG": "<your-workspace-slug>",
        "PLANE_BASE_URL": "https://api.plane.so"
      }
    }
  }
}
```

self-hosted Plane의 경우 `PLANE_BASE_URL`을 `https://plane.shaul.kr`로 변경.

### Cycles API (스프린트 관리)

Plane의 Cycle은 스프린트에 해당하는 개념으로 API를 통해:
- 사이클 생성/수정/삭제
- 이슈를 사이클에 추가/제거
- 사이클 간 이슈 이전
- 사이클 목록 조회 및 아카이브

---

## 5. PM Agent 기능 요건

AI PM agent 일반 사례 조사 결과, 다음 기능이 핵심으로 파악되었다:

### 필수 기능

| 기능 | 설명 |
|------|------|
| 이슈 분해 | 큰 요청을 sub-issue로 분해, 우선순위/의존성 설정 |
| 스프린트 계획 | 백로그 분석, 팀 역량 기반 스프린트 범위 추천 |
| 진행 상황 추적 | In Progress / 블로킹 이슈 요약, 위험 감지 |
| 블로커 감지 | 의존성이 완료되지 않은 이슈, 장기 미진행 이슈 감지 |
| 작업 위임 | 이슈 내용 기반으로 be/fe/infra/research 에이전트에 라우팅 |

### 선택 기능 (2차)

| 기능 | 설명 |
|------|------|
| 릴리즈 계획 | 완료 예측, 릴리즈 범위 제안 |
| 스프린트 회고 | 사이클 완료 후 속도(velocity) 분석 |
| 자동 이슈 생성 | 사용자의 자연어 요청에서 이슈 자동 생성 |

---

## 핵심 발견사항

1. **Plane 공식 MCP 서버가 존재한다**: `makeplane/plane-mcp-server`는 55+ 도구로 이슈·사이클·모듈을 직접 관리할 수 있어, 기존 curl 기반 skills를 대체하거나 보완할 수 있다.

2. **Coordinator와 PM agent는 레이어가 다르다**: Coordinator는 실행 라우팅(Control Layer), PM agent는 계획 수립(Planning Layer)을 담당한다. 역할이 겹치지 않으므로 두 에이전트가 공존할 수 있다.

3. **Claude Code sub-agent frontmatter가 PM agent 요건을 충족한다**: `mcpServers`, `skills`, `memory`, `tools: Agent(...)` 필드 조합으로 Plane 연동 + 영속 메모리 + 하위 에이전트 위임이 모두 가능하다.

4. **80~90% 자동화 + 사람 체크포인트가 실용적이다**: PM agent가 계획을 수립하고 사용자가 승인 후 실행하는 Human-in-the-Loop 패턴이 업계 표준이다.

5. **기존 plane-issues/start/done 스킬은 PM agent의 도구로 흡수할 수 있다**: PM agent의 `skills` frontmatter에 등록하면 독립 스킬로 유지하면서도 PM agent 컨텍스트에서 통합 활용이 가능하다.

---

## 프로젝트 적용 가능성

claude-forge에서 PM agent는 다음 방식으로 도입할 수 있다:

1. `.claude/agents/pm-agent.md` 로 sub-agent 정의 (Plane MCP + skills 포함)
2. `.claude/skills/pm/SKILL.md` 로 `/pm` 스킬 추가 (사용자 직접 호출 진입점)
3. Plane MCP 서버를 `.mcp.json`에 전역 설정하거나 PM agent에만 scoped로 설정
4. PM agent가 분해한 이슈를 coordinator가 be/fe/infra/research로 라우팅

---

## 참고 자료

- [CrewAI Planning 공식 문서](https://docs.crewai.com/en/concepts/planning)
- [CrewAI Custom Manager Agent](https://docs.crewai.com/how-to/custom-manager-agent)
- [CrewAI Hierarchical Process](https://docs.crewai.com/how-to/hierarchical-process)
- [LangGraph 공식 사이트](https://www.langchain.com/langgraph)
- [LangGraph AI Sprint Planner 구현 사례](https://medium.com/@jalajagr/how-i-built-an-ai-powered-multi-agent-project-planner-with-langgraph-no-pm-experience-needed-a-f1599f9ec645)
- [Microsoft Planner AI Agent 발표](https://techcommunity.microsoft.com/blog/plannerblog/unleashing-the-power-of-agents-in-microsoft-planner/4304794)
- [Agentic Project Management Framework](https://agentic-project-management.dev/)
- [Agentic PM Github (sdi2200262)](https://github.com/sdi2200262/agentic-project-management)
- [claude-mpm: Claude Multi-Agent PM](https://github.com/bobmatnyc/claude-mpm)
- [Claude Code Sub-agents 공식 문서](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Skills 공식 문서](https://code.claude.com/docs/en/skills)
- [Plane MCP Server (공식)](https://github.com/makeplane/plane-mcp-server)
- [Plane Cycles API](https://developers.plane.so/api-reference/cycle/overview)
- [Multi-Agent System Patterns (Medium)](https://medium.com/@mjgmario/multi-agent-system-patterns-a-unified-guide-to-designing-agentic-architectures-04bb31ab9c41)
- [AI Agents in Project Management (Atlassian)](https://www.atlassian.com/agile/project-management/ai-agents)
- [OpenHands SDK 논문](https://arxiv.org/abs/2407.16741)
