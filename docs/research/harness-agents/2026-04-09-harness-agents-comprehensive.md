# Claude Code 하네스 에이전트 종합 조사

> 조사일: 2026-04-09
> 카테고리: official-docs, web, opensource
> 태그: claude-code, harness, sub-agent, multi-agent, coordinator, frontmatter, context-engineering, verification-loop

---

## 요약

Claude Code에서 "하네스(Harness)"는 언어 모델을 유능한 코딩 에이전트로 변환하는 실행 환경 전체를 의미한다. 에이전트(Sub-agent)는 각자의 컨텍스트 윈도우, 커스텀 시스템 프롬프트, 특정 도구 접근 권한을 가진 특화된 AI 보조자로서, `description` 필드를 기반으로 라우팅된다. 공식 스펙은 `name`, `description`, `tools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `effort`, `isolation`, `color`, `initialPrompt` 총 14개 frontmatter 필드를 지원한다. 멀티 에이전트 시스템은 Sub-agents(단일 세션 내 위임)와 Agent Teams(세션 간 독립 협력)의 두 가지 모드로 운영되며, Anthropic 실험에서 coordinator+worker 패턴이 단일 에이전트 대비 90.2% 성능 향상을 기록했다.

---

## 조사 배경

claude-forge는 Claude Code 사용자가 AI 하네스를 설계·구축·평가하는 플랫폼이다. 플랫폼 자체가 coordinator → be-developer, fe-developer, infra-engineer, research의 멀티 에이전트 구조로 운영된다. 에이전트 구성 방법, 최적화 전략, 평가 기준을 체계적으로 문서화하여 하네스 설계 기능의 기반 지식으로 활용하고자 조사를 수행했다.

---

## 1. 하네스와 에이전트의 정의

### 1.1 하네스(Harness)란

하네스는 언어 모델과 현실 세계 사이의 모든 실행 환경이다. 공식 정의: "언어 모델을 유능한 코딩 에이전트로 변환하는 프레임워크". 하네스는 다음을 담당한다:

- **도구 표면(Tool Surface)**: 약 19개의 권한 게이트 도구 제공 (파일 읽기/편집, Bash, Git, 웹, MCP 등)
- **권한 관리**: 3계층 구조 (자동 승인 → 확인 필요 → 명시적 승인)
- **컨텍스트 관리**: 세션 저장, 토큰 관리, 자동 압축
- **MCP 통합**: 외부 도구와의 연결

다르게 말하면: "하네스가 어려운 부분이다. 모델 개발은 상대적으로 직관적이지만, 신뢰할 수 있는 실행 환경 구축이 실제 엔지니어링 복잡도의 대부분을 차지한다."

### 1.2 에이전트(Sub-agent)란

Sub-agent는 특화된 AI 보조자다. 핵심 특성:

- **독립적 컨텍스트 윈도우**: 메인 대화와 분리된 컨텍스트
- **커스텀 시스템 프롬프트**: frontmatter body가 시스템 프롬프트가 됨
- **특정 도구 접근 권한**: 허용/차단 도구 목록 제어
- **자율 실행 후 결과 반환**: 완료 후 요약만 메인 컨텍스트로 반환

### 1.3 내장 Sub-agents

Claude Code는 다음의 내장 에이전트를 자동으로 사용한다:

| 에이전트 | 모델 | 도구 | 용도 |
|---------|------|------|------|
| Explore | Haiku | 읽기 전용 | 빠른 코드베이스 탐색 |
| Plan | 메인 상속 | 읽기 전용 | Plan mode에서 컨텍스트 수집 |
| General-purpose | 메인 상속 | 전체 | 복잡한 다단계 작업 |
| statusline-setup | Sonnet | - | `/statusline` 실행 시 |
| Claude Code Guide | Haiku | - | 기능 질문 응답 시 |

---

## 2. 에이전트 구성 방법

### 2.1 파일 구조

Sub-agent는 YAML frontmatter + Markdown body로 구성된 `.md` 파일이다.

```
.claude/agents/         # 프로젝트 에이전트 (우선순위 3)
~/.claude/agents/       # 사용자 에이전트, 모든 프로젝트 적용 (우선순위 4)
--agents CLI 플래그      # 세션 한정 에이전트 (우선순위 2)
managed settings        # 조직 전체 에이전트 (우선순위 1)
plugin agents/          # 플러그인 에이전트 (우선순위 5)
```

같은 이름이 있을 경우 우선순위 1(높음) → 5(낮음) 순으로 우선 적용된다.

### 2.2 전체 Frontmatter 스펙

공식 문서에서 확인된 모든 필드:

| 필드 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `name` | Yes | - | 소문자+하이픈 고유 식별자 |
| `description` | Yes | - | 라우팅 트리거 — Claude가 이 텍스트를 기반으로 위임 결정 |
| `tools` | No | 전체 상속 | 허용 도구 목록 (allowlist) |
| `disallowedTools` | No | - | 차단 도구 목록 (denylist). 두 필드 모두 있으면 deny 먼저 적용 후 allow 해석 |
| `model` | No | `inherit` | `sonnet`, `opus`, `haiku`, 전체 모델 ID, 또는 `inherit` |
| `permissionMode` | No | `default` | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | No | - | 최대 에이전트 턴 수 |
| `skills` | No | - | 시작 시 컨텍스트에 주입할 스킬 목록 (이름 배열). 부모에서 상속되지 않음 |
| `mcpServers` | No | - | 에이전트 전용 MCP 서버 (인라인 정의 또는 이름 참조) |
| `hooks` | No | - | 에이전트 생명주기 훅 (`PreToolUse`, `PostToolUse`, `Stop`) |
| `memory` | No | - | 영구 메모리 범위: `user`, `project`, `local` |
| `background` | No | `false` | `true`이면 항상 백그라운드 실행 |
| `effort` | No | 세션 상속 | 노력 수준: `low`, `medium`, `high`, `max` (Opus 4.6 전용) |
| `isolation` | No | - | `worktree`: 임시 git worktree에서 격리 실행 |
| `color` | No | - | UI 표시 색상: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan` |
| `initialPrompt` | No | - | `--agent` 플래그로 메인 세션으로 실행될 때 자동 제출되는 첫 메시지 |

### 2.3 모델 해석 우선순위

Claude Code는 다음 순서로 모델을 결정한다:

1. `CLAUDE_CODE_SUBAGENT_MODEL` 환경 변수
2. 호출 시점의 per-invocation `model` 파라미터
3. 에이전트 정의의 `model` frontmatter
4. 메인 대화의 모델

### 2.4 기본 에이전트 예시

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
memory: project
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)
```

### 2.5 Coordinator 에이전트 — 서브에이전트 스폰 제어

```markdown
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

`Agent(worker, researcher)`: `worker`와 `researcher` 에이전트만 스폰 가능 (allowlist)
`Agent`: 제한 없이 모든 서브에이전트 스폰 가능
`Agent` 생략: 어떤 서브에이전트도 스폰 불가

### 2.6 MCP 서버 범위 지정

```yaml
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  # 인라인 정의 — 이 에이전트에만 스코프
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # 이름 참조 — 이미 설정된 서버 공유
  - github
---
```

인라인 정의는 에이전트가 시작될 때 연결, 종료 시 해제된다. 부모 대화에는 해당 도구가 노출되지 않으므로 컨텍스트를 절약할 수 있다.

### 2.7 훅을 활용한 조건부 제어

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

`validate-readonly-query.sh`가 exit code 2를 반환하면 해당 명령이 차단된다.

---

## 3. 멀티 에이전트 아키텍처

### 3.1 Sub-agents vs Agent Teams

| 비교 항목 | Sub-agents | Agent Teams |
|---------|------------|-------------|
| **컨텍스트** | 독립 컨텍스트; 결과를 caller에 반환 | 독립 컨텍스트; 완전히 독립 |
| **통신** | 메인 에이전트에만 결과 반환 | 팀원 간 직접 메시지 가능 |
| **조정** | 메인 에이전트가 모든 작업 관리 | 공유 태스크 목록으로 자기 조정 |
| **적합한 경우** | 결과만 중요한 집중 태스크 | 토론과 협력이 필요한 복잡 작업 |
| **토큰 비용** | 낮음: 결과 요약만 메인 컨텍스트로 | 높음: 각 팀원이 독립 Claude 인스턴스 |
| **중첩** | 서브에이전트가 서브에이전트 불가 | 팀원이 팀을 만들 수 없음 |

**선택 기준**: 워커들이 서로 소통해야 하면 Agent Teams, 결과만 필요하면 Sub-agents.

### 3.2 Anthropic이 검증한 5가지 패턴

| 패턴 | 구조 | 적합한 경우 |
|------|------|-------------|
| **단일 에이전트** | 하나의 에이전트가 전체 처리 | 단순하고 명확한 작업 |
| **프롬프트 체이닝** | 순차 처리, 이전 출력 → 다음 입력 | 단계가 명확히 정의된 파이프라인 |
| **라우터** | 입력 조건에 따라 다른 에이전트로 분기 | 작업 유형이 여러 가지인 경우 |
| **오케스트레이터-워커** | 부모 에이전트가 자식들 조율 | 복잡한 프로젝트, 병렬 처리 가능 |
| **스웜** | 여러 에이전트가 수평적으로 협력 | 독립적인 병렬 탐색 |

### 3.3 Coordinator 패턴 운영 원칙

claude-forge의 현재 구조(coordinator → 전문 에이전트)는 오케스트레이터-워커 패턴이다:

- Coordinator는 라우팅만 담당, 직접 구현 금지
- 작업을 도메인 경계(be/fe/infra/research)로 분리
- Coordinator가 `description`을 기반으로 적절한 에이전트 선택

Anthropic 실험 결과: Opus 4.6 리드 에이전트 + Sonnet 4.6 서브에이전트 조합이 단일 Opus 4.6 에이전트 대비 **90.2% 성능 향상**.

### 3.4 병렬 vs 순차 실행 결정

**병렬 실행**: 3개 이상의 독립 태스크, 도메인 경계가 명확, 파일 충돌 없음
```text
Research the authentication, database, and API modules in parallel using separate subagents
```

**순차 실행**: 다운스트림 태스크가 업스트림 결과에 의존
```text
schema → API → frontend chains, research → planning → implementation
```

**백그라운드 실행**: 비차단 리서치, 코드베이스 분석, 보안 감사

---

## 4. Description 작성 베스트 프랙티스

`description` 필드는 라우팅의 핵심이다. Claude가 이 텍스트를 기반으로 언제 위임할지 결정한다.

### 4.1 효과적인 description 원칙

1. **명확한 트리거 조건 명시**: "Use proactively after writing or modifying code"
2. **도메인 명시**: 에이전트가 어떤 분야의 전문가인지 명확히
3. **"proactively" 키워드**: 자동 위임을 권장하는 경우 추가
4. **부정 케이스 제외**: 어떤 상황에 사용하지 말아야 하는지도 포함 가능

### 4.2 좋은 예 vs 나쁜 예

| 나쁜 예 | 좋은 예 |
|---------|---------|
| `Reviews code` | `Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.` |
| `Debugging helper` | `Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.` |
| `Backend developer` | `PHP/Laravel backend developer. Use for implementing API endpoints, database migrations, service layer, and server-side business logic.` |

### 4.3 서브에이전트 호출 방법

1. **자연어**: `"Use the test-runner subagent to fix failing tests"` — Claude가 위임 여부 결정
2. **@-mention**: `@"code-reviewer (agent)" look at the auth changes` — 특정 에이전트 강제 실행
3. **세션 전체**: `claude --agent code-reviewer` — 전체 세션을 해당 에이전트로 실행
4. **settings.json**: `{ "agent": "code-reviewer" }` — 프로젝트 기본 에이전트 설정

---

## 5. 에이전트 최적화

### 5.1 컨텍스트 토큰 최적화

서브에이전트의 핵심 가치: **컨텍스트 보전**

- 탐색/조사 작업 → 서브에이전트에 위임 → 요약만 메인 컨텍스트로 반환
- 대량 출력 작업(테스트 실행, 로그 처리) → 서브에이전트 격리
- 메인 컨텍스트가 구현에만 집중 가능

```text
Use subagents to investigate how our authentication system handles token
refresh, and whether we have any existing OAuth utilities I should reuse.
```

### 5.2 모델 선택 기준

| 모델 | 비용 | 적합한 에이전트 유형 |
|------|------|---------------------|
| claude-opus-4-6 | 높음 | 아키텍처 설계, 보안 감사, 복잡한 코드 리뷰 (wshobson/agents 기준: 42개 에이전트) |
| claude-sonnet-4-6 | 중간 | 일반 개발, 테스팅, 문서화 (기본 추천) |
| claude-haiku-4-5 | 낮음 | Explore 에이전트, SEO, 배포, 단순 조회 |
| inherit | - | 부모 세션 모델 상속 (기본값) |

**비용 최적화**: `CLAUDE_CODE_SUBAGENT_MODEL` 환경변수로 모든 서브에이전트 모델을 일괄 설정 가능

### 5.3 maxTurns 설정 전략

- 읽기 전용 리뷰어: 5-10 턴 (탐색 + 보고)
- 구현 에이전트: 20-50 턴 (파일 수에 비례)
- 복잡한 디버거: 30-60 턴
- 미설정 시: Claude Code 기본 제한 적용

### 5.4 Memory 활용

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: project
---

Update your agent memory as you discover codepaths, patterns, library
locations, and key architectural decisions. This builds up institutional
knowledge across conversations.
```

| 범위 | 위치 | 공유 |
|------|------|------|
| `user` | `~/.claude/agent-memory/<name>/` | 모든 프로젝트 |
| `project` | `.claude/agent-memory/<name>/` | 팀 공유 (버전 관리) |
| `local` | `.claude/agent-memory-local/<name>/` | 개인 전용 (비공개) |

메모리 파일 첫 200줄 또는 25KB가 세션 시작 시 자동 로드된다.

### 5.5 Skills 주입

서브에이전트는 부모의 스킬을 상속하지 않는다. 명시적으로 주입해야 한다:

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---
```

전체 스킬 내용이 에이전트 컨텍스트에 주입된다.

### 5.6 isolation으로 안전한 실험

```yaml
---
name: refactor-agent
description: Refactors code safely in an isolated environment
isolation: worktree
---
```

`worktree` 설정 시 임시 git worktree에서 실행 → 변경사항 없으면 자동 정리.

---

## 6. 에이전트 평가 및 품질

### 6.1 Anthropic의 평가 프레임워크

Anthropic 공식 자료 "Demystifying Evals for AI Agents"에서 발췌:

**3가지 채점자 유형**:

| 유형 | 강점 | 약점 | 적합한 경우 |
|------|------|------|------------|
| **코드 기반** | 빠름, 저렴, 객관적, 재현 가능 | 유효한 변형에 취약 | 테스트 통과, 린트, 타입 체크 |
| **모델 기반** | 유연함, 확장 가능 | 비결정적, 비용 큼 | 코드 품질, 설명의 명확성 |
| **인간 채점** | 금본위 품질 | 느리고 비쌈 | 보정, 중요 의사결정 |

**핵심 메트릭**:
- `Pass@k`: k번 중 최소 1회 성공 (하나의 해결책만 필요한 경우)
- `Pass^k`: k번 모두 성공 (일관된 사용자 경험 필요 시)

### 6.2 Verification Loops 설계

Claude Code의 핵심 자기 검증 사이클: **Gather Context → Take Action → Verify Results**

```text
# 검증 기준을 명시적으로 제공
"write a validateEmail function. example test cases:
user@example.com is true, invalid is false. run the tests after implementing"

# 시각적 검증
"implement this design. take a screenshot of the result and
compare it to the original. list differences and fix them"
```

검증 전략:
- 테스트 스위트 (단위/통합 테스트)
- 린터/타입 체커
- 스크린샷 비교 (UI 변경 시)
- 로그 분석
- 훅을 통한 자동 검증

### 6.3 Hooks를 통한 자동 품질 게이트

**SubagentStop 훅**으로 에이전트 완료 후 검증:

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/run-quality-checks.sh" }
        ]
      }
    ]
  }
}
```

**TeammateIdle, TaskCreated, TaskCompleted** (Agent Teams):
- exit code 2로 작업 완료를 차단하고 피드백 전송 가능

### 6.4 에이전트 평가 단계별 로드맵

1. **20-50개 태스크로 시작**: 수동 테스트 중 발견한 실패 케이스 포함
2. **명확한 태스크 작성**: 두 전문가가 독립적으로 동일한 통과/불통과 판정에 도달 가능해야 함
3. **균형 잡힌 테스트셋**: 해야 하는 케이스 + 하면 안 되는 케이스 균형
4. **격리된 환경**: 각 시행은 이전 시행의 상태 없이 시작
5. **결정적 채점자 우선**: 유연성이 필요한 경우만 모델 기반 채점자 추가
6. **트랜스크립트 검토**: 채점자가 공정하게 작동하는지 직접 확인

### 6.5 평가 프레임워크 도구

| 도구 | 특징 |
|------|------|
| Harbor | 컨테이너화된 에이전트 실행 |
| Braintrust | 오프라인+온라인 평가 및 모니터링 |
| LangSmith | LangChain 통합 |
| Langfuse | 자체 호스팅 오픈소스 |

---

## 7. 베스트 프랙티스 및 안티패턴

### 7.1 에이전트 설계 원칙

1. **단일 책임**: 각 에이전트는 하나의 특화된 작업에 집중
2. **명확한 description**: Claude가 언제 위임할지 정확히 알 수 있도록
3. **최소 권한**: 필요한 도구만 허용
4. **버전 관리 포함**: 프로젝트 에이전트는 `.claude/agents/`에 커밋

### 7.2 에이전트 수 결정

**Agent Teams 권장 팀 구성**: 3-5명 팀원 (더 많으면 조정 오버헤드 증가, 수익 체감)

**서브에이전트 수 결정 기준**:
- 독립적인 도메인 경계가 있는가? → 도메인별 에이전트
- 컨텍스트 격리가 필요한가? → 서브에이전트
- 단순 순차 작업인가? → 메인 대화에서 처리

**에이전트당 태스크**: 5-6개 태스크가 효율적

### 7.3 흔한 안티패턴

| 안티패턴 | 증상 | 해결책 |
|---------|------|--------|
| **부엌 싱크 세션** | 관련 없는 작업이 동일 컨텍스트에 혼재 | `/clear`로 컨텍스트 초기화 |
| **반복 수정 루프** | 같은 오류를 2회 이상 수정 | `/clear` 후 더 구체적인 초기 프롬프트로 재시작 |
| **과도한 CLAUDE.md** | 지시사항이 무시됨 | 200줄 이하로 유지, 불필요한 내용 제거 |
| **무제한 탐색** | 수백 개 파일 읽어 컨텍스트 낭비 | 조사 범위 명시 또는 서브에이전트 위임 |
| **과잉 병렬화** | 토큰 낭비, 관련 마이크로태스크 분산 | 관련 태스크 그룹화 |
| **모호한 서브에이전트 지시** | 실행 실패 (context 부족) | 파일 경로, 성공 기준, 구체적 범위 명시 |
| **파일 충돌** | 같은 파일 동시 수정 | 에이전트별 파일 오너십 분리 |

### 7.4 메인 대화 vs 서브에이전트 선택

**메인 대화 사용 시**:
- 빈번한 반복/개선이 필요한 경우
- 여러 단계가 공통 컨텍스트 공유 (planning → implementation → testing)
- 빠른 소규모 변경
- 지연시간이 중요한 경우

**서브에이전트 사용 시**:
- 대량 출력 발생 (테스트 실행, 로그 처리)
- 도구 제한이 필요한 경우
- 자기완결적이고 요약 반환 가능한 작업

---

## 8. 커뮤니티 생태계 및 오픈소스

### 8.1 주요 오픈소스 프로젝트

| 프로젝트 | 특징 |
|---------|------|
| [wshobson/agents](https://github.com/wshobson/agents) | 77개 플러그인, 182개 에이전트, 3계층 모델 전략, 16개 워크플로우 오케스트레이터 |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | 130+ 특화 서브에이전트, 10개 카테고리, 대화형 설치 |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 큐레이션 리소스 모음, 37.6k 스타 |
| [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | 하네스 최적화 시스템, 108개 스킬, 25개 에이전트 |
| [Chachamaru127/claude-code-harness](https://github.com/Chachamaru127/claude-code-harness) | TypeScript 가드레일 엔진, Plan→Work→Review 사이클 |
| [HKUDS/OpenHarness](https://github.com/HKUDS/OpenHarness) | 경량 에이전트 인프라 연구용 |

### 8.2 wshobson/agents 3계층 모델 전략

| 계층 | 모델 | 에이전트 수 | 용도 |
|------|------|------------|------|
| 1 | Opus 4.6 | 42개 | 아키텍처, 보안, 코드 리뷰 |
| 2 | inherit | 42개 | 사용자 선택 가능 |
| 3 | Sonnet 4.6 | 51개 | 문서, 테스트, 디버깅 |
| 4 | Haiku 4.5 | 18개 | SEO, 배포, 단순 작업 |

### 8.3 Claude Code vs 유사 도구 비교

| 비교 항목 | Claude Code | Cursor | Windsurf | Aider |
|---------|------------|--------|---------|-------|
| **에이전트 아키텍처** | Sub-agents + Agent Teams (공식) | Composer 멀티 에이전트 (8개 동시) | Cascade 엔진, 2025.12부터 병렬 에이전트 | 단일 에이전트 |
| **컨텍스트 관리** | 독립 컨텍스트 윈도우, 격리 우수 | 200K → 1M 확장 | 200K → 1M 확장 | 제한적 |
| **대규모 코드베이스** | 40+ 파일에서 아키텍처 일관성 유지 강점 | 컨텍스트 손실 발생 가능 | 컨텍스트 손실 발생 가능 | 제한적 |
| **환경** | 터미널 기반 (CLI 우선) | IDE (VS Code fork) | IDE (VS Code fork) | 터미널 |
| **커스텀 에이전트** | `.claude/agents/` 공식 지원 | 제한적 | 없음 | 없음 |
| **오픈소스 생태계** | 활발 (37.6k 스타 awesome-claude-code) | 제한적 | 제한적 | 활발 |

Claude Code의 핵심 차별점: 커스텀 에이전트 공식 지원, 독립 컨텍스트 격리, 대규모 코드베이스 추론 우수.

---

## 9. 핵심 발견사항

1. **하네스는 실행 환경의 총체이다**: 모델보다 하네스 설계가 더 어렵고, 실제 엔지니어링 복잡도의 대부분을 차지한다. claude-forge가 이 복잡성을 추상화하는 것 자체가 핵심 가치다.

2. **Description이 라우팅의 전부다**: `description` 필드 하나로 언제 자동 위임될지 결정된다. "proactively", "use when", "use immediately after" 등의 트리거 키워드가 라우팅 정확도를 높인다.

3. **컨텍스트 격리가 핵심 성능 최적화다**: 서브에이전트를 사용하는 주된 이유는 특화 기능보다 컨텍스트 격리다. 조사/탐색 작업을 서브에이전트로 위임하면 메인 컨텍스트가 구현에만 집중 가능하다.

4. **Coordinator+Worker 패턴은 검증된 성능 향상 전략이다**: Anthropic 실험에서 단일 에이전트 대비 90.2% 성능 향상. claude-forge의 현재 구조가 올바른 방향이다.

5. **Sub-agents와 Agent Teams의 선택 기준은 통신 필요성이다**: 에이전트 간 직접 소통이 필요하면 Agent Teams (현재 실험적), 결과 위임만 필요하면 Sub-agents.

6. **평가는 초기부터 필수다**: "평가 없이 일하는 팀은 반응적 루프에 빠진다. 초기에 투자한 팀은 반대 경험을 한다 — 실패가 테스트 케이스가 되면서 개발이 가속화된다."

---

## 10. claude-forge 프로젝트 적용 가능성

### 10.1 현재 에이전트 구조 검토

현재 claude-forge의 에이전트 구성을 공식 스펙과 비교하면:

**즉시 개선 가능한 항목**:
- 각 에이전트 `.md` 파일에 `description` 최적화 (트리거 키워드 추가)
- `memory: project` 설정으로 에이전트 학습 누적
- `model` 명시 (coordinator: inherit, 전문 에이전트: sonnet)
- `maxTurns` 설정으로 비용 제어

**중기 개선 항목**:
- `hooks.PreToolUse`/`PostToolUse`로 자동 품질 게이트 추가
- `isolation: worktree`로 리팩토링 에이전트 안전화
- research 에이전트에 `memory: project` 설정으로 조사 결과 누적

### 10.2 하네스 설계 위자드 — 플랫폼 기능 제안

claude-forge의 핵심 기능으로 "하네스 설계 위자드"를 구현할 때 다음 정보가 필요하다:

**에이전트 설정 필드**:
- 필수: `name`, `description`
- 선택: `model` (드롭다운), `tools` (체크박스), `permissionMode` (드롭다운), `maxTurns` (숫자), `memory` (라디오), `skills` (다중 선택)

**아키텍처 패턴 선택**:
- 단일 에이전트 / 프롬프트 체이닝 / 라우터 / 오케스트레이터-워커 / 스웜

**평가 구성**:
- 코드 기반 채점자 / 모델 기반 채점자 / 인간 검토 조합

### 10.3 6축 프레임워크와의 매핑

| claude-forge 6축 | Sub-agent 관련 기능 |
|----------------|-------------------|
| Context Engineering | `skills` 주입, `CLAUDE.md` 상속, description 최적화 |
| Verification Loops | `hooks.PostToolUse`, `TaskCompleted` 훅, 테스트 자동 실행 |
| State Management | `memory: project/user/local`, auto-memory |
| Tool Orchestration | `tools` allowlist, `mcpServers` 인라인 정의 |
| Human-in-the-Loop | `permissionMode: default/plan`, `background: false` |
| Lifecycle Management | `hooks.SubagentStart/Stop`, `TeammateIdle`, `TaskCreated` |

---

## 참고 자료

### 공식 문서
- [Sub-agents 공식 문서](https://code.claude.com/docs/en/sub-agents) — 전체 frontmatter 스펙
- [Agent Teams 공식 문서](https://code.claude.com/docs/en/agent-teams) — 멀티 에이전트 협력 아키텍처
- [Best Practices 공식 문서](https://code.claude.com/docs/en/best-practices) — 컨텍스트 관리, 최적화
- [Memory 공식 문서](https://code.claude.com/docs/en/memory) — CLAUDE.md, auto-memory

### Anthropic 블로그
- [Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) — 에이전트 평가 방법론

### 오픈소스
- [wshobson/agents](https://github.com/wshobson/agents) — 77개 플러그인, 182개 에이전트
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) — 130+ 서브에이전트
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) — 큐레이션 리소스
- [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) — 하네스 최적화 시스템

### 기술 아티클
- [Claude Code Agent Harness Architecture](https://wavespeed.ai/blog/posts/claude-code-agent-harness-architecture/) — 하네스 아키텍처 심층 분석
- [Claude Code AI Harness Design Patterns](https://claudelab.net/en/articles/claude-code/claude-code-ai-harness-design-patterns) — 5가지 검증된 패턴
- [Sub-Agent Best Practices](https://claudefa.st/blog/guide/agents/sub-agent-best-practices) — 병렬 vs 순차 패턴
- [Everything Claude Code Guide](https://www.bighatgroup.com/blog/everything-claude-code-ai-agent-harness-guide/) — 종합 하네스 가이드
- [Cursor vs Windsurf vs Claude Code 2026](https://dextralabs.com/blog/claude-code-vs-cursor-vs-windsurf/) — 유사 도구 비교
