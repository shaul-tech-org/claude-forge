# API 레퍼런스

Base URL: `http://localhost:8000/api`

## Health Check

```
GET /health
```

응답:
```json
{ "status": "ok", "timestamp": "2026-04-09T12:00:00.000Z" }
```

---

## CLI API (`/v1/cli/`)

### POST `/v1/cli/scan`

`.claude/` 디렉토리를 스캔하여 에이전트, 스킬, 규칙을 파싱한다.

**Request**
```json
{ "path": "/path/to/project" }
```
`path` 미지정 시 기본값: `config('forge.project_root')`

**Response**
```json
{
  "agents": [
    { "name": "coordinator", "description": "...", "model": "sonnet", "instructions": "..." }
  ],
  "skills": [
    { "name": "be", "description": "...", "userInvocable": true, "args": "...", "instructions": "..." }
  ],
  "rules": [
    { "label": "PHP 코딩 규칙", "category": "backend/php", "paths": ["**/*.php"], "content": "..." }
  ],
  "projectPath": "/path/to/project"
}
```

### POST `/v1/cli/validate`

설정의 유효성을 검증한다.

**Request**
```json
{
  "config": {
    "agents": [{ "name": "my-agent", "model": "sonnet" }],
    "skills": [{ "name": "my-skill" }],
    "rules": [{ "label": "my-rule", "content": "..." }]
  }
}
```

**Response**
```json
{ "valid": true, "errors": [] }
```

에러 시:
```json
{ "valid": false, "errors": [{ "field": "agents.0.name", "message": "Agent name is required" }] }
```

### POST `/v1/cli/apply`

검증된 설정을 프로젝트에 파일로 적용한다.

**Request**
```json
{
  "path": "/path/to/project",
  "config": { "agents": [...], "skills": [...], "rules": [...] },
  "mode": "merge"
}
```

`mode`: `merge` (기존 보존) | `overwrite` (덮어쓰기)

**Response**
```json
{
  "created": [".claude/agents/my-agent.md"],
  "updated": [".claude/rules/common/general.md"],
  "skipped": []
}
```

---

## Recommendation API (`/v1/`)

### GET `/v1/stacks`

지원하는 기술 스택 목록을 조회한다.

**Response**
```json
{
  "data": [
    { "id": "react", "name": "React", "category": "frontend", "implies": ["typescript", "jsx"] },
    { "id": "laravel", "name": "Laravel", "category": "backend", "implies": ["php"] },
    { "id": "typescript", "name": "TypeScript", "category": "language", "implies": [] }
  ]
}
```

카테고리: `frontend`, `backend`, `language`, `infra`

### POST `/v1/recommendations`

기술 스택 조합에 따른 규칙 + 스킬 추천을 생성한다.

**Request**
```json
{ "stacks": ["react", "laravel"] }
```

**Response**
```json
{
  "stacks": [...],
  "rules": [
    { "label": "React Hooks 규칙", "category": "frontend/react", "paths": ["**/*.tsx"], "content": "..." }
  ],
  "skills": [
    { "name": "test-runner", "description": "...", "userInvocable": true, "instructions": "..." }
  ]
}
```

### GET `/v1/rules-db`

전체 규칙 데이터베이스를 조회한다.

**Response**
```json
{
  "data": {
    "react": [{ "label": "...", "category": "...", "paths": [...], "content": "..." }],
    "laravel": [...]
  },
  "meta": { "total_stacks": 15, "total_rules": 120 }
}
```

### GET `/v1/rules-db/{stackId}`

특정 스택의 상세 규칙을 조회한다.

**Response**
```json
{
  "data": {
    "stack_id": "react",
    "rules": [...],
    "count": 12
  }
}
```

---

## Harness API (`/v1/harness/`)

### GET `/v1/patterns`

패턴 라이브러리를 조회한다.

**Response**
```json
{
  "data": [
    {
      "id": "solo",
      "name": "Solo Agent",
      "category": "basic",
      "description": "...",
      "team_size": "1",
      "complexity": "low",
      "expected_scores": { "context": 60, "verification": 40, "state": 30, "tools": 50, "human": 60, "lifecycle": 20 }
    }
  ],
  "categories": ["basic", "intermediate", "advanced"]
}
```

### GET `/v1/patterns/{id}`

패턴 상세 정보를 조회한다 (노드/엣지 다이어그램 포함).

### POST `/v1/harness/evaluate`

하네스를 6축 프레임워크로 평가한다.

**Request**
```json
{
  "agents": [...],
  "skills": [...],
  "rules": [...],
  "claudeMd": "# Project...",
  "hooks": {},
  "settings": { "permissions": { "allow": [...] } }
}
```

**Response**
```json
{
  "scores": {
    "context": { "axis": "context", "score": 85, "grade": "A", "checklist": {...}, "suggestions": [...] },
    "verification": { "axis": "verification", "score": 60, "grade": "C", "checklist": {...}, "suggestions": [...] }
  },
  "overall": 72,
  "grade": "B",
  "top_priority": "lifecycle"
}
```

등급: S(90+), A(80+), B(70+), C(60+), D(0-59)

### POST `/v1/harness/context-budget`

컨텍스트 토큰 예산을 계산한다.

**Request**
```json
{
  "agents": [...],
  "rules": [...],
  "claudeMd": "..."
}
```

**Response**
```json
{
  "total_capacity": 200000,
  "fixed_usage": 15000,
  "available": 185000,
  "utilization": 0.075,
  "breakdown": { "system_prompt": 3000, "system_tools": 11000, "agents": 600, "rules": 400 },
  "warnings": []
}
```

### POST `/v1/harness/recommend`

팀 규모와 우선순위 기반 패턴 추천.

### POST `/v1/import/github`

GitHub URL에서 `.claude/` 설정을 import한다.

**Request**
```json
{ "url": "https://github.com/user/repo" }
```
