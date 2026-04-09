---
name: harness-review
description: 하네스 구성을 점검하고 에이전트 메모리 데이터를 분석하여 개선 피드백을 제공한다.
user-invocable: true
---

# Harness Review — 하네스 구성 점검 및 메모리 분석

현재 하네스 구성을 종합적으로 점검하고, 에이전트 메모리 누적 데이터를 분석하여 개선 사항을 제안한다.

## 실행 절차

1. **에이전트 구성 점검**
   - `.claude/agents/` 아래 모든 에이전트의 frontmatter 검증
   - description 트리거 키워드 확인
   - tools 최소 권한 준수 확인
   - memory/maxTurns 설정 확인

2. **에이전트 메모리 분석**
   - `.claude/agent-memory/` 아래 각 에이전트의 MEMORY.md 읽기
   - 누적된 패턴, 컨벤션, 반복 실수 분석
   - 에이전트 간 중복 학습 식별

3. **스킬 정합성 검증**
   - 에이전트가 참조하는 스킬이 실제 존재하는지 확인
   - 스킬 간 중복 기능 식별

4. **컨텍스트 예산 분석**
   - `/context` 결과 기반 토큰 사용량 분석
   - 최적화 가능 영역 식별

5. **보고서 출력**

```markdown
## 하네스 점검 보고서

### 에이전트 상태
| 에이전트 | description | memory | tools | maxTurns | 상태 |
...

### 메모리 분석
- {에이전트}: {학습된 패턴 수}, {주요 발견사항}

### 컨텍스트 예산
- 고정 비용: {tokens}
- 가변 비용: {tokens}
- 최적화 여지: {제안}

### 개선 제안
1. {제안 1}
2. {제안 2}
...
```

## 사용 예시

```
/harness-review
```
