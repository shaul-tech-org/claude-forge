---
name: infra
description: 인프라 작업을 infra-engineer 에이전트에 직접 위임한다. Coordinator를 거치지 않고 Docker/CI 작업을 빠르게 처리할 때 사용.
user-invocable: true
argument-hint: "작업 내용 (예: 'Dockerfile 멀티스테이지 빌드 최적화', 'GitHub Actions 프론트엔드 파이프라인 추가')"
---

# 인프라 작업 직접 위임

infra-engineer 에이전트에 인프라 작업을 직접 위임한다.

## 인자

- `$ARGUMENTS`: 작업 내용 (필수)

## 실행 절차

1. `$ARGUMENTS`의 작업 내용을 분석한다.

2. 작업이 인프라 영역인지 확인한다:
   - Docker, Docker Compose, Dockerfile, CI/CD, GitHub Actions, 배포, 환경설정 관련 → 진행
   - 백엔드/프론트엔드 영역이면 → 사용자에게 `/be` 또는 `/fe` 사용을 안내하고 중단

3. infra-engineer 에이전트에 아래 컨텍스트와 함께 위임한다:
   - 작업 내용: `$ARGUMENTS`
   - 현재 git 브랜치명
   - 관련 파일이 있다면 해당 경로

4. 에이전트 작업 완료 후 결과를 요약하여 사용자에게 보고한다:
   - 생성/수정된 파일 목록
   - 검증 결과 (docker compose config, 빌드 테스트 등)
   - 환경 변수 변경이 있을 경우 안내

## 사용 예시

```
/infra Dockerfile 멀티스테이지 빌드 최적화
/infra GitHub Actions 프론트엔드 파이프라인 추가
/infra docker-compose 개발/프로덕션 환경 분리
```
