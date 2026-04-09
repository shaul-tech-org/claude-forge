---
name: pm-status
description: 현재 스프린트 진행 상황을 종합 보고한다. In Progress/Done/Todo 이슈 현황, 완료율, 블로커를 요약.
user-invocable: true
---

# PM Status — 스프린트 현황 보고

pm-agent에 현재 스프린트 진행 상황 보고를 요청한다.

## 실행 절차

1. `.env` 파일에서 `PLANE_API_KEY`를 읽는다.

2. Plane API를 호출하여 전체 이슈 상태를 조회한다:

```bash
# Todo 이슈
curl -s -H "x-api-key: $PLANE_API_KEY" \
  "https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/0f65355d-c8c4-4d17-a1a4-6f7002b0ab06/issues/?state=ecfd19f1-9e2f-4001-822f-5471ec98a425&per_page=50"

# In Progress 이슈
curl -s -H "x-api-key: $PLANE_API_KEY" \
  "https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/0f65355d-c8c4-4d17-a1a4-6f7002b0ab06/issues/?state=aff7c00b-733a-4b14-ad93-d374a39c92b4&per_page=50"

# Done 이슈
curl -s -H "x-api-key: $PLANE_API_KEY" \
  "https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/0f65355d-c8c4-4d17-a1a4-6f7002b0ab06/issues/?state=0631f6ef-03dd-49b9-92bb-672aa4a54784&per_page=50"
```

3. 결과를 아래 형식으로 종합 보고한다:

```
## 스프린트 현황

### 요약
- 전체: {total}건
- Done: {done}건 ({done/total * 100}%)
- In Progress: {in_progress}건
- Todo: {todo}건

### 블로커 감지
- [있을 경우] 7일 이상 In Progress 상태인 이슈 목록

### In Progress
- FORGE-{id}: {name} [{priority}] — {assignee}

### Todo
- FORGE-{id}: {name} [{priority}]

### 최근 완료 (Done)
- FORGE-{id}: {name} — 완료일: {updated_at}
```

## 사용 예시

```
/pm-status
```
