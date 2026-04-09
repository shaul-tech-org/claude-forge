---
name: plane-start
description: Plane 이슈 작업 시작. 이슈 상태를 In Progress로 변경하고 작업 브랜치를 생성한다.
user-invocable: true
argument-hint: "FORGE-{번호} 형식의 이슈 번호"
---

# Plane 이슈 작업 시작

이슈를 In Progress로 변경하고 작업 환경을 준비한다.

## 인자

- `$ARGUMENTS`: `FORGE-{번호}` 형식 (예: `FORGE-12`)

## 설정

- **Plane URL**: `https://plane.shaul.kr`
- **Workspace**: `shaul-org`
- **Project ID**: `0f65355d-c8c4-4d17-a1a4-6f7002b0ab06`
- **In Progress State ID**: `aff7c00b-733a-4b14-ad93-d374a39c92b4`

## 실행 절차

1. `$ARGUMENTS`에서 이슈 번호(sequence_id)를 추출한다.
2. `.env` 파일에서 `PLANE_API_KEY` 값을 읽는다.
3. 이슈 목록에서 해당 sequence_id의 이슈를 찾는다:

```bash
curl -s -H "x-api-key: $PLANE_API_KEY" \
  "https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/0f65355d-c8c4-4d17-a1a4-6f7002b0ab06/issues/?per_page=100" \
  | python3 -c "import sys,json; issues=json.load(sys.stdin)['results']; match=[i for i in issues if i['sequence_id']=={번호}]; print(json.dumps(match[0],indent=2)) if match else print('NOT FOUND')"
```

4. 이슈 상태를 In Progress로 변경:

```bash
curl -s -X PATCH \
  -H "x-api-key: $PLANE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"state": "aff7c00b-733a-4b14-ad93-d374a39c92b4"}' \
  "https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/0f65355d-c8c4-4d17-a1a4-6f7002b0ab06/issues/{issue_id}/"
```

5. Git 브랜치 생성:

```bash
git checkout -b feature/FORGE-{번호}-{이슈명을-kebab-case로}
```

6. 이슈의 상세 내용(name, description_html, priority, sub-issues)을 출력하여 작업 컨텍스트를 제공한다.

## 사용 예시

```
/plane-start FORGE-12
```
