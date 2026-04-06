---
paths:
  - "**/*.php"
  - "**/routes/*.php"
  - "**/composer.json"
---

# Laravel 일반 규칙

## 구조
```
app/
├── Http/
│   ├── Controllers/     # 라우팅만 (thin controller)
│   ├── Requests/        # Form Request 검증
│   └── Resources/       # API Resource 변환
├── Models/              # Eloquent 모델
├── Services/            # 비즈니스 로직
├── Repositories/        # 데이터 접근 추상화
└── Exceptions/          # 커스텀 예외
```

## Controller
- 단일 책임: 요청 받기 → Service 호출 → 응답 반환
- 비즈니스 로직은 Service에 위임
- API Resource로 응답 포맷 통일
- Route Model Binding 활용

## Service 패턴
- 비즈니스 로직은 Service 클래스에 집중
- Service는 Repository를 통해 데이터 접근
- 트랜잭션은 Service에서 관리 (`DB::transaction()`)

## 라우팅
- API 라우트: `routes/api.php`
- RESTful 명명 (index, store, show, update, destroy)
- Route Group으로 prefix/middleware 정리
- API versioning: `/api/v1/`

## 설정
- `.env` 직접 참조 금지 → `config()` 헬퍼 사용
- config 파일에서 `env()` 호출
- `php artisan config:cache` 호환성 유지

## 테스트
- Pest 우선 (PHPUnit도 가능)
- Feature Test: HTTP 요청 기반
- Unit Test: Service/Repository 단위
- Factory + Seeder로 테스트 데이터
