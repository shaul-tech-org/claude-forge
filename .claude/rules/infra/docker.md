---
paths:
  - "**/Dockerfile*"
  - "**/docker-compose*"
  - "**/.dockerignore"
---

# Docker 규칙

## Dockerfile
- 멀티 스테이지 빌드 (빌드/실행 분리)
- 불필요한 레이어 최소화
- .dockerignore 필수
- 비 root 사용자로 실행
- 최소 베이스 이미지 사용

## Docker Compose
- 서비스별 healthcheck 설정
- restart: unless-stopped
- 볼륨: 데이터 영속성 확보
- 네트워크: 서비스 간 격리

## 서비스 구성
```yaml
services:
  app:        # PHP/Laravel (포트: 8000)
  frontend:   # React (포트: 3000)
  postgres:   # PostgreSQL 18 (포트: 5432)
```
