---
name: plane-done
description: Plane 이슈 작업 완료. 이슈 상태를 Done으로 변경하고 작업 요약 코멘트를 추가한다.
user-invocable: true
argument-hint: "FORGE-{번호} 형식의 이슈 번호 (생략 시 현재 브랜치에서 추출)"
---

# Plane 이슈 작업 완료

이슈를 Done으로 변경하고 작업 결과를 코멘트로 남긴다.

## 인자

- `$ARGUMENTS`: `FORGE-{번호}` (선택 — 생략 시 현재 git 브랜치명에서 추출)

## 설정

- **Plane URL**: `https://plane.shaul.kr`
- **Workspace**: `shaul-org`
- **Project ID**: `0f65355d-c8c4-4d17-a1a4-6f7002b0ab06`
- **Done State ID**: `0631f6ef-03dd-49b9-92bb-672aa4a54784`

## 실행 절차

1. 이슈 번호를 결정한다:
   - `$ARGUMENTS`가 있으면 해당 번호 사용
   - 없으면 `git branch --show-current`에서 `FORGE-{번호}` 추출

2. `.env` 파일에서 `PLANE_API_KEY` 값을 읽는다.

3. 이슈 ID를 조회한다 (plane-start와 동일 방식).

4. `git log`로 해당 브랜치의 커밋 목록을 수집하여 작업 요약을 생성한다.

5. 이슈에 작업 완료 코멘트를 추가한다:

```bash
curl -s -X POST \
  -H "x-api-key: $PLANE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"comment_html": "<p><strong>작업 완료</strong></p><ul>{커밋 요약 리스트}</ul>"}' \
  "https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/0f65355d-c8c4-4d17-a1a4-6f7002b0ab06/issues/{issue_id}/comments/"
```

6. 이슈 상태를 Done으로 변경:

```bash
curl -s -X PATCH \
  -H "x-api-key: $PLANE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"state": "0631f6ef-03dd-49b9-92bb-672aa4a54784"}' \
  "https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/0f65355d-c8c4-4d17-a1a4-6f7002b0ab06/issues/{issue_id}/"
```

7. 완료된 이슈 정보와 요약을 출력한다.

## 사용 예시

```
/plane-done FORGE-12
/plane-done               ← 현재 브랜치에서 이슈 번호 자동 추출
```
