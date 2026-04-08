---
name: plane-issues
description: Plane 이슈 목록 조회. Todo/In Progress 상태의 이슈를 확인하여 작업 대상을 파악한다.
user_invocable: true
---

# Plane 이슈 조회

Plane API를 호출하여 현재 프로젝트의 이슈 목록을 조회한다.

## 설정

- **Plane URL**: `https://plane.shaul.kr`
- **Workspace**: `shaul-org`
- **Project ID**: `0f65355d-c8c4-4d17-a1a4-6f7002b0ab06`
- **Project Identifier**: `FORGE`
- **API Key**: `.env` 파일의 `PLANE_API_KEY` 값 사용

## 상태 ID 매핑

| 상태 | ID | Group |
|------|-----|-------|
| Backlog | `19dd4e9a-cfd8-430e-8920-92eabee31979` | backlog |
| Todo | `ecfd19f1-9e2f-4001-822f-5471ec98a425` | unstarted |
| In Progress | `aff7c00b-733a-4b14-ad93-d374a39c92b4` | started |
| Done | `0631f6ef-03dd-49b9-92bb-672aa4a54784` | completed |
| Cancelled | `1696eee7-f885-4a40-902a-c47fa0d61fba` | cancelled |

## 실행 절차

1. `.env` 파일에서 `PLANE_API_KEY` 값을 읽는다.
2. 아래 API를 호출하여 Todo + In Progress 이슈를 조회한다:

```bash
# Todo 이슈
curl -s -H "x-api-key: $PLANE_API_KEY" \
  "https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/0f65355d-c8c4-4d17-a1a4-6f7002b0ab06/issues/?state=ecfd19f1-9e2f-4001-822f-5471ec98a425&per_page=50"

# In Progress 이슈
curl -s -H "x-api-key: $PLANE_API_KEY" \
  "https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/0f65355d-c8c4-4d17-a1a4-6f7002b0ab06/issues/?state=aff7c00b-733a-4b14-ad93-d374a39c92b4&per_page=50"
```

3. 결과를 아래 형식으로 정리하여 출력한다:

```
## In Progress
- FORGE-{sequence_id}: {name} [{priority}]

## Todo
- FORGE-{sequence_id}: {name} [{priority}]
```

4. sub-issue가 있는 경우, parent 이슈 아래에 들여쓰기로 표시한다.
