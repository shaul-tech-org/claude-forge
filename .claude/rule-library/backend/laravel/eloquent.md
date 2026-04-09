---
paths:
  - "**/*.php"
---

# Laravel Eloquent ORM 규칙

## N+1 문제 방지
- 관계 데이터 접근 시 반드시 eager loading 사용 (`with()`, `load()`)
- `preventLazyLoading()` 활성화 (AppServiceProvider에서)
- 컬렉션 내 관계 접근 전 `loadMissing()` 확인

## Mass Assignment 보호
- `$fillable` 또는 `$guarded` 반드시 정의
- `Model::unguard()` 사용 금지
- Form Request에서 검증 후 `$request->validated()`로 전달

## 쿼리 최적화
- `select()`로 필요한 컬럼만 조회
- 대량 데이터는 `chunk()` 또는 `cursor()` 사용
- `count()` 대신 `exists()` (존재 여부 확인 시)
- 인덱스가 필요한 컬럼은 Migration에서 정의

## 관계 정의
- 역관계도 함께 정의 (hasMany ↔ belongsTo)
- 피벗 테이블은 알파벳 순서 (post_tag, 아닌 tag_post)
- 다형성 관계는 `morphTo()` 타입 명시

## Soft Delete
- 중요 데이터는 SoftDeletes 트레이트 사용
- `withTrashed()`, `onlyTrashed()` 활용
