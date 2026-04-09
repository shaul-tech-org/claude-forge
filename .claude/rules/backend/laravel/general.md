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
- API 라우트: `routes/api.php`, 웹 라우트: `routes/web.php`
- 클로저 라우트 금지 — 컨트롤러 사용 (캐싱 호환)
- RESTful 명명 (index, store, show, update, destroy)
- Route Group으로 prefix/middleware 정리
- Route Model Binding 활용
- API versioning: `apiPrefix: 'api/v1'`

## 추가 규칙
- `/rules list` — 사용 가능한 상세 규칙 목록 확인
- `/rules preset api` — API 개발 규칙셋 활성화
- `/rules activate <규칙명>` — 개별 규칙 활성화
- 상세 규칙은 `.claude/rule-library/backend/laravel/`에 보관

## 설정
- `.env` 직접 참조 금지 → `config()` 헬퍼 사용
- config 파일에서 `env()` 호출
- `php artisan config:cache` 호환성 유지

## 테스트
- Pest 우선 (PHPUnit도 가능)
- Feature Test: HTTP 요청 기반
- Unit Test: Service/Repository 단위
- Factory + Seeder로 테스트 데이터
