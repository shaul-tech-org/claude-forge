---
name: rules
description: "Laravel 규칙 관리 — 사용할 규칙을 선택적으로 활성화/비활성화한다."
user-invocable: true
argument-hint: "서브커맨드 [인자...] (예: 'list', 'activate routing middleware', 'preset api', 'deactivate all')"
---

# Laravel 규칙 관리

Laravel 규칙 라이브러리에서 필요한 규칙만 선택하여 활성화/비활성화한다.

## 경로

- **라이브러리**: `.claude/rule-library/backend/laravel/` — 전체 규칙 보관 (자동 로드 안 됨)
- **활성 디렉토리**: `.claude/rules/backend/laravel/` — 활성 규칙 (Claude Code 자동 로드)
- **기본 규칙**: `general.md` — 항상 활성 (삭제/비활성화 불가)

## 인자

- `$ARGUMENTS`: 서브커맨드와 인자

## 서브커맨드

### `list` (기본값, 인자 없을 때)
1. `.claude/rule-library/backend/laravel/` 의 모든 `.md` 파일을 나열한다 (`_index.md` 제외).
2. `.claude/rules/backend/laravel/` 에 같은 이름이 있으면 `[활성]`, 없으면 `[비활성]` 으로 표시한다.
3. 프리셋 목록도 함께 보여준다.

### `activate <규칙1> [규칙2...]`
1. 지정된 규칙 이름 (`.md` 확장자 생략 가능)에 대해:
   - `.claude/rule-library/backend/laravel/{name}.md` 파일이 존재하는지 확인한다.
   - 존재하면 `.claude/rules/backend/laravel/{name}.md` 로 **복사**한다.
   - 이미 활성이면 "이미 활성 상태" 메시지를 출력한다.
2. 활성화된 규칙 목록을 출력한다.

### `deactivate <규칙1> [규칙2...]`
1. 지정된 규칙 이름에 대해:
   - `general.md`이면 "기본 규칙은 비활성화할 수 없습니다" 메시지를 출력하고 건너뛴다.
   - `.claude/rules/backend/laravel/{name}.md` 파일을 **삭제**한다 (라이브러리 원본은 유지).
2. 비활성화된 규칙 목록을 출력한다.

### `deactivate all`
1. `.claude/rules/backend/laravel/` 에서 `general.md`를 제외한 모든 `.md` 파일을 삭제한다.
2. 결과를 출력한다.

### `preset <이름>`
1. 먼저 `deactivate all`을 실행한다 (general.md 제외 전체 비활성화).
2. 프리셋에 해당하는 규칙들을 한 번에 활성화한다:

| 프리셋 | 포함 규칙 |
|--------|----------|
| `api` | controllers, requests, responses, validation, middleware, routing, errors, eloquent, migration |
| `web` | controllers, requests, responses, validation, middleware, routing, errors, eloquent, migration, views, blade, csrf, session, vite |
| `minimal` | controllers, eloquent, migration, validation |

3. 활성화된 규칙 목록을 출력한다.

### `active`
1. `.claude/rules/backend/laravel/` 의 활성 규칙만 나열한다.

### `show <규칙>`
1. `.claude/rule-library/backend/laravel/{name}.md` 파일의 내용을 읽어서 보여준다.
2. 존재하지 않으면 에러 메시지를 출력한다.

## 실행 절차

1. `$ARGUMENTS`를 파싱하여 서브커맨드와 인자를 분리한다.
2. 인자가 없으면 `list`를 실행한다.
3. 해당 서브커맨드를 실행한다.
4. 결과를 사용자에게 표 형식으로 보고한다.

## 출력 형식 (list)

```
## Laravel 규칙 현황

| 규칙 | 상태 | 영역 | 설명 |
|------|------|------|------|
| controllers | ✅ 활성 | HTTP | Controller 패턴 |
| requests | ⬜ 비활성 | HTTP | Request 처리 |
| ... | ... | ... | ... |

## 프리셋
- `api` — API 개발 (9개 규칙)
- `web` — 웹 풀스택 (15개 규칙)
- `minimal` — 최소 (4개 규칙)

> 사용법: `/rules activate routing middleware` 또는 `/rules preset api`
```

## 사용 예시

```
/rules                    ← 전체 규칙 목록 + 상태 표시
/rules active             ← 현재 활성 규칙만 표시
/rules show controllers   ← 특정 규칙 내용 확인
/rules activate routing middleware
/rules deactivate routing
/rules deactivate all     ← 전체 비활성화 (general 제외)
/rules preset api         ← API 프리셋 일괄 활성화
/rules preset web
/rules preset minimal
```
