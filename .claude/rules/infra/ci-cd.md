---
paths:
  - ".github/workflows/**"
---

# CI/CD 규칙

## GitHub Actions 구조
- 백엔드/프론트엔드 파이프라인 분리
- `paths` 필터로 변경된 코드에 해당하는 파이프라인만 트리거

## 백엔드 CI (`backend-ci.yml`)
트리거: `backend/**` 변경 시
1. Laravel Pint — 코드 스타일 검사
2. PHPStan — 정적 분석 (도입 시)
3. Pest — 테스트 실행 (SQLite in-memory)

## 프론트엔드 CI (`frontend-ci.yml`)
트리거: `frontend/**` 변경 시
1. ESLint — 린트 검사
2. tsc --noEmit — 타입 체크
3. Vitest — 테스트 실행
4. Vite build — 빌드 검증

## 파이프라인 원칙
- PR과 main 브랜치 push에 실행
- 각 단계는 독립적으로 실패 가능 (fail-fast: false 권장하지 않음)
- 시크릿은 GitHub Secrets로 관리
- 캐싱: Composer(vendor), npm(node_modules) 캐시 활용
- timeout: 백엔드 10분, 프론트엔드 10분

## DON'T
- 테스트를 건너뛰는 설정 추가 금지
- CI에서 프로덕션 시크릿 사용 금지
- 불필요한 서비스(DB 등)를 프론트엔드 CI에 추가 금지
