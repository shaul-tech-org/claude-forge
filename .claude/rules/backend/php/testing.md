---
paths:
  - "backend/tests/**/*.php"
  - "backend/app/**/*.php"
---

# 백엔드 테스트 규칙

## 테스트 프레임워크
- Pest + PHPUnit 사용
- 테스트 DB: SQLite in-memory (`phpunit.xml` 설정 준수)

## 테스트 구조
- `tests/Unit/`: 단위 테스트 (외부 의존성 없음)
- `tests/Feature/`: 기능 테스트 (HTTP 요청, DB 연동)
- 파일명: `{대상클래스}Test.php`

## 작성 원칙
- 새로운 기능 구현 시 Feature 테스트 필수
- Service 클래스는 Unit 테스트 작성
- 테스트 메서드명: `it('설명', function() {})` (Pest 스타일)
- Given-When-Then 패턴 권장
- Factory 활용하여 테스트 데이터 생성

## CI 연동
- `php artisan test` 또는 `./vendor/bin/pest`로 실행
- 테스트 실패 시 CI 파이프라인 중단
