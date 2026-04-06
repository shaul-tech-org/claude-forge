---
paths:
  - "**/*.php"
  - "**/migrations/*.php"
---

# Laravel Migration 규칙

## 필수
- Migration은 항상 `up()`과 `down()` 모두 구현
- 테이블명: 복수형 snake_case (posts, user_profiles)
- 외래키는 `constrained()` 사용
- 인덱스: 자주 검색/정렬하는 컬럼에 명시적 추가

## 컬럼 규칙
- id: `$table->id()` (bigIncrements)
- UUID 필요 시: `$table->uuid('id')->primary()`
- timestamps: `$table->timestamps()` 필수
- softDeletes: 필요 시 `$table->softDeletes()`
- nullable은 명시적으로 (`->nullable()`)

## 금지
- Migration에서 Eloquent 모델 사용 금지 (DB 파사드 사용)
- 기존 Migration 수정 금지 (새 Migration 생성)
- `dropColumn()`은 SQLite에서 제한 있음 — 별도 Migration으로 분리
