---
paths:
  - "**/*.php"
---

# PHP 코딩 규칙

## 코딩 표준
- PSR-12 준수
- PHP 8.4 기능 활용 (readonly, enum, union types, named arguments)
- strict_types 선언 필수 (`declare(strict_types=1);`)
- 타입 힌팅 필수 (파라미터, 반환 타입, 프로퍼티)

## 네이밍
- 클래스: PascalCase
- 메서드/변수: camelCase
- 상수: SCREAMING_SNAKE_CASE
- 파일명: 클래스명과 동일

## 보안
- 사용자 입력 항상 검증
- SQL: Eloquent 또는 parameterized query (raw SQL 금지)
- XSS: 출력 시 이스케이프
- CSRF: Laravel 미들웨어 활용
