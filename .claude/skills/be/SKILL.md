---
name: be
description: 백엔드 작업을 be-developer 에이전트에 직접 위임한다. Coordinator를 거치지 않고 PHP/Laravel 작업을 빠르게 처리할 때 사용.
user-invocable: true
argument-hint: "작업 내용 (예: '유저 API CRUD 구현', 'posts 테이블 마이그레이션 추가')"
---

# 백엔드 작업 직접 위임

be-developer 에이전트에 백엔드 작업을 직접 위임한다.

## 인자

- `$ARGUMENTS`: 작업 내용 (필수)

## 실행 절차

1. `$ARGUMENTS`의 작업 내용을 분석한다.

2. 작업이 백엔드 영역인지 확인한다:
   - PHP, Laravel, API, Eloquent, Migration, Service, Controller, Test(Pest) 관련 → 진행
   - 프론트엔드/인프라 영역이면 → 사용자에게 `/fe` 또는 `/infra` 사용을 안내하고 중단

3. be-developer 에이전트에 아래 컨텍스트와 함께 위임한다:
   - 작업 내용: `$ARGUMENTS`
   - 현재 git 브랜치명
   - 관련 파일이 있다면 해당 경로

4. 에이전트 작업 완료 후 결과를 요약하여 사용자에게 보고한다:
   - 생성/수정된 파일 목록
   - 테스트 실행 결과
   - 추가 작업이 필요한 경우 안내

## 사용 예시

```
/be 유저 API CRUD 구현
/be posts 테이블 마이그레이션 추가
/be 인증 미들웨어 리팩토링
```
