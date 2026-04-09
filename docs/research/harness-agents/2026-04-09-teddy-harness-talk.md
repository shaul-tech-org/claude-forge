# Agent Harness — 테디노트 이경록 발표 정리

> 출처: 2026년 3월 패스트캠퍼스 주주총회 발표 자료
> 발표자: 테디노트 이경록
> 정리일: 2026-04-09
> 태그: harness, context-engineering, memory, skill, sub-agent, commands, hooks, planning

---

## 1. 하네스란 무엇인가?

**정의**: 모델을 감싸서 장기 실행 작업을 신뢰성 있게 관리하는 시스템

### 하네스의 6가지 구성 요소

| 요소 | 역할 |
|------|------|
| **Human-in-the-Loop** | 위험 결정(DB 삭제, 카드 결제, 이메일 발송)에서 사람 승인 |
| **Filesystem Access** | 허용 디렉토리, 읽기/쓰기 권한, 충돌 해결 정의 |
| **Tool Orchestration** | 도구 호출 순서, 에러 핸들링, 무한 루프/캐스케이딩 실패 방지 |
| **Sub-agent Coordination** | 전문 에이전트 간 통신, 출력 병합, 충돌 해결 |
| **Prompt Presets** | 작업별 최적화된 사전 정의 프롬프트 라이브러리 |
| **Lifecycle Hooks** | 초기화 → 실행 → 상태 저장 → 실패 핸들링 → 재시도 → 로깅 워크플로우 |

---

## 2. Context Engineering

### 핵심 원칙

1. Context = Claude Code의 중요 참조 지식
2. Context의 **질적 우수함**이 성공 코딩에 **결정적**
3. 하지만 Context는 **제한적** → 작업(Task)에 따른 **Best Context** 구성 필수

### 컨텍스트 최적화가 필요한 이유

**최대한 256K 안쪽으로 사용하도록!**

MRCR v2 (8-needle) Long-context retrieval 벤치마크:

| 모델 | 256K | 1M |
|------|------|------|
| Opus 4.6 | **93.0%** | 76.0% |
| Sonnet 4.5 | 10.8% | 18.5% |

→ 256K에서 Opus 4.6의 검색 정확도가 압도적으로 높다.

### 고정된 지식 vs 가변하는 지식

- **공통 RULE은 고정으로 Load**: 코드 컨벤션, 테스트 코드 작성 방법 등
- 작업별 맞춤형 Context 구성은 필수이지만, 불변 규칙은 항상 로딩

### 고정된 지식의 7가지 구성

| # | 항목 | 토큰 | 특징 |
|---|------|------|------|
| 1 | System Prompt | ~3k | 수정 불가 (`--append-system-prompt`로 추가만 가능) |
| 2 | System Tools | ~11k | 내장 도구 정의, **가장 큰 고정 비용** |
| 3 | Memory Files (CLAUDE.md) | 가변 | 계층적 로딩 (전역→프로젝트→로컬→부모) |
| 4 | .claude/rules/*.md | 가변 | `paths` frontmatter로 조건부 로딩 |
| 5 | Auto Memory (MEMORY.md) | 가변 | `~/.claude/projects/` 하위, 200줄 제한 |
| 6 | Custom Agents | 가변 | `.claude/agents/` 정의도 **항상** context에 포함 |
| 7 | CLAUDE.md 참조 파일 | 가변 | `@path/to/file` 문법, 재귀 import 최대 5단계 |

#### CLAUDE.md 계층 구조

| 파일 위치 | 범위 | 특징 |
|---------|------|------|
| `~/.claude/CLAUDE.md` | 전역 (모든 프로젝트) | 개인 선호 설정 |
| `./CLAUDE.md` | 프로젝트 루트 | Git으로 팀 공유 |
| `./CLAUDE.local.md` | 프로젝트 (개인) | `.gitignore` 처리 권장 |
| 부모 디렉토리 `CLAUDE.md` | 상위 경로 전체 | 계층적으로 모두 로딩 |

---

## 3. Memory 관리

### 메인 세션: Auto Memory

- `MEMORY.md`에 메모리를 Auto Load
- **200줄 제한**
- 자동 저장하거나 MEMORY.md를 수동 수정 가능 (OpenClaw의 SOUL.md 역할)
- `/memory` → Auto-memory: on 설정

### Subagent Memory — agent-memory (신규)

- Sub-agent 정의 파일에 `memory` 필드를 설정하면, **scope에 따라 persistent 디렉토리 생성**
- scope: `user`, `project`, `local`
- 미설정 시 메모리 활용 안 함
- `.claude/agent-memory/` 하위에 에이전트별 디렉토리 생성

---

## 4. Skill vs Agent

### 구분

| | 스킬 (Skill) | 에이전트 (Agent) |
|---|------|------|
| **실행 위치** | 메인 Context 안에서 호출 | Sub-agent로 위임 (독립 컨텍스트) |
| **용도** | CC 자체로 할 수 없는 새로운 기능 | 독립적인 역할을 가진 작업 수행 |
| **예시** | 카카오톡 메시지, Gmail 요약, HWP 처리 | Frontend Engineer, Backend Engineer |

### 에이전트는 기능 분리가 핵심

- Frontend Engineer: frontend 관련 스킬만 로드 / browser-mcp 로그
- Backend Engineer: backend 관련 스킬과 지식만 로드

### 에이전트를 너무 많이 만들면?

> **999+ 에이전트를 가지고 있는 것이 좋은가? NO!**

- Frontmatter를 Context에 **항상 로드** → 너무 많으면 컨텍스트 낭비
- 너무 작은 역할 기반으로 나누면, **위임할 때 모호성** 증가
- 나쁜 예: Frontend Engineer, CSS Engineer, HTML Engineer, Next.js Engineer → 과도한 분리

---

## 5. Commands (커맨드)

### Sub-agent의 제약과 Command의 역할

| 제약 | 설명 | Command의 역할 |
|------|------|--------------|
| **Context 전달 채널 단일** | Sub-agent는 부모 대화를 모른다 | 필요한 정보를 모두 파일에 명시 |
| **중첩 호출 불가** | Sub-agent → Sub-agent 불가 | 오케스트레이션 로직을 Command에 |
| **Context 오염 방지** | 탐색 결과가 주 대화에 쌓임 | Sub-agent로 격리, 요약만 반환 |
| **Plan 모드 없음** | Sub-agent는 즉시 실행 | 단계별 절차를 Command에 명시 |
| **비결정적 LLM 동작** | 매번 다른 결과 가능 | 프롬프트 파일로 동작 고정 |
| **도구 권한 제한** | 기본은 모든 도구 허용 | allowedTools로 안전하게 제한 |

### 핵심 교훈

- Command 없이 매번 자연어로 지시하면 → **토큰 낭비 + 컨텍스트 오염**
- Command 파일은 **프롬프트를 버전 관리** 가능한 파일 → 팀 전체가 동일한 결과

---

## 6. Hooks

- **나만의 Harness를 만들기 위해 필수적으로 알아야 함**
- `.claude/settings.json`에 정의
- Lifecycle: SessionStart → UserPromptSubmit → PreToolUse → [tool executed] → PostToolUse → SubagentStart/Stop → TaskCreated/Completed → ...
- PreToolUse 예시: `Bash("rm *")` 매칭 → `block-rm.sh` 실행 → `permissionDecision: "deny"`

---

## 7. Planning — 200만줄 CC 코딩의 교훈

### "Planning 없이 구현하지 마라!"

- `shift + tab`으로 Plan mode 활성화하고 살자

### Planning 단계에서 철저히 검증

1. **Brainstorming skill** (superpowers) 활용
2. **Interview skill** 만들기 — 최소 10개 이상의 질문을 하도록
3. 개발 용어와 지식을 총 망라하여 **기획/설계를 탄탄하게**
4. 검증 Plan은 최소 **85% coverage**

### 지시 방법

> "일반 자연어"로 지시하는 것보다 "**개발/아키텍처 지식을 주입**" 하는 관점이 훨씬 좋다

나쁜 예: "OOO RAG 챗봇 만들어줘~"

좋은 예: "벡터DB는 Chroma를 쓰고, Hybrid 검색에 비율은 6:4 semantic 가중치 주고, langgraph state graph로 만들고, 모델은 gpt-5.2 사용하고, 출처를 표기하는 프롬프트를 가진 챗봇 만들어줘"

→ **Software/Framework를 공부한 사람이 유리할 수밖에 없다**

### 작업 완성 3단계

1. **Brainstorming** (https://github.com/obra/superpowers)
2. Brainstorming 기반으로 **Draft** 작성
3. 작성된 Draft를 **Review** — 적극 개입하여 우리의 생각과 "일치" 확인

→ 이 단계에서 **탄탄한 기획서**가 나와야 한다

---

## 8. 추가 교훈 (More Lesson Learned)

### CC로 안 풀리면 Codex 시도

- 완전히 다르게 구성된 Context + Model 특성 차이
- "우리의 CLAUDE.md, MEMORY.md, rules, context → **완벽하지 않았지!!!**"

### 도구 추천

- **Skill Creator** 플러그인으로 시작: `/plugins` → skill-creator 검색 → 설치
- **Git Worktree** 필수: 병렬 작업 시 격리된 환경 제공
- **ast-grep**: grep보다 정확한 AST 기반 코드 검색 (문법 구조 이해, False Positive 적음)

### 개발 아키텍처 패러다임 변화

**기존**: 고정된 워크플로우, Feedback 루프로 인한 수정 반영이 제한적

**Ambient Agent (2025.01)**: Agent → Human Feedback → Memory updating → Testing

**진화된 구조**: User Request → Agent ← Skills Pool + Memory, Feedback으로 Skill/Memory 동시 업데이트

**Self-evolving 시스템**: 피드백 기반으로 성능이 점진적으로 향상 (Number of Fixes ↑ → Performance ↑)

---

## 9. 참고 자료

- [modu-ai/moai-adk](https://github.com/modu-ai/moai-adk)
- [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [ohmyopenagent.com/ko](https://ohmyopenagent.com/ko)
- [ohmyopenagent.com/ko/docs](https://ohmyopenagent.com/ko/docs)
- [obra/superpowers - brainstorming skill](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md)
- [anthropic/skills - skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)
- [ast-grep](https://github.com/ast-grep/ast-grep)

---

## claude-forge 프로젝트 적용 시사점

| 항목 | 현재 상태 | 개선 방향 |
|------|---------|---------|
| Context 최적화 | CLAUDE.md 47% 절감 완료 | 에이전트 수 관리 주의 (현재 5개 → 적정) |
| Memory | Auto Memory만 사용 | 에이전트별 `memory: project` 추가 |
| Commands | 스킬 파일에 절차 명시 중 | Sub-agent 위임 시 더 상세한 Command 필요 |
| Planning | 미적용 | Brainstorming/Interview 스킬 도입 검토 |
| Hooks | 미적용 | PreToolUse 안전장치 등 도입 검토 |
| 도구 | grep 사용 중 | ast-grep 도입 검토 |
