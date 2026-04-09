---
paths:
  - "**/routes/*.php"
  - "**/bootstrap/app.php"
  - "**/*.php"
---

# Laravel 13 라우팅 규칙

## 라우트 파일 구조
- `routes/web.php` — 웹 인터페이스 (세션, CSRF 보호, `web` 미들웨어)
- `routes/api.php` — API (상태 비저장, `api` 미들웨어) — `php artisan install:api`로 생성
- `routes/console.php` — Artisan 명령어 정의
- `bootstrap/app.php` — 라우팅 설정 중앙 관리 (`withRouting()`)

## HTTP 메서드
```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);

// 복수 메서드
Route::match(['get', 'post'], '/', $callback);

// 전체 메서드
Route::any('/', $callback);
```
- `any`, `match`, `redirect` 라우트는 구체적 메서드(`get`, `post` 등) 뒤에 정의

## 라우트 파라미터

### 필수 파라미터
```php
Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
    // 파라미터는 이름이 아닌 순서로 주입
});
```

### 선택 파라미터
```php
Route::get('/user/{name?}', function (?string $name = null) {
    // ...
});
```

### 정규식 제약
```php
// where() — 단일/복수
->where('id', '[0-9]+')
->where(['id' => '[0-9]+', 'name' => '[a-z]+'])

// 헬퍼 메서드
->whereNumber('id')
->whereAlpha('name')
->whereAlphaNumeric('slug')
->whereUuid('id')
->whereUlid('id')
```

## 이름 지정 (Named Routes)
```php
Route::get('/user/{id}', [UserController::class, 'show'])->name('user.show');

// URL 생성
$url = route('user.show', ['id' => 1]);
```
- RESTful 명명: `{resource}.{action}` (index, store, show, update, destroy)

## 라우트 그룹

### 미들웨어
```php
Route::middleware(['auth', 'verified'])->group(function () {
    // ...
});
```

### 컨트롤러
```php
Route::controller(UserController::class)->group(function () {
    Route::get('/users', 'index')->name('users.index');
    Route::get('/users/{user}', 'show')->name('users.show');
    Route::post('/users', 'store')->name('users.store');
});
```

### 프리픽스 + 이름 프리픽스
```php
Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'admin'])
    ->group(function () {
        // /admin/users → name: admin.users
    });
```

### 서브도메인
```php
Route::domain('{account}.example.com')->group(function () {
    Route::get('/', function (string $account) { /* ... */ });
});
```

## Route Model Binding

### 암시적 바인딩 (Implicit)
```php
// 기본: id로 조회
Route::get('/user/{user}', function (User $user) {
    return $user;
});

// 커스텀 키
Route::get('/user/{user:username}', function (User $user) {
    // username 컬럼으로 조회
});
```

### Enum 바인딩
```php
Route::get('/orders/{status}', function (OrderStatus $status) {
    // Backed Enum 값으로 자동 변환
});
```

### 명시적 바인딩 (Explicit) — AppServiceProvider
```php
Route::model('user', User::class);

Route::bind('user', function (string $value) {
    return User::where('username', $value)->firstOrFail();
});
```

## 편의 라우트

### 리다이렉트
```php
Route::redirect('/old', '/new');           // 302
Route::redirect('/old', '/new', 301);      // 301
Route::permanentRedirect('/old', '/new');   // 301
```

### 뷰 직접 반환
```php
Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```
- 예약 파라미터명: `view`, `data`, `status`, `headers` — 라우트 파라미터로 사용 금지

## 폴백 라우트
```php
Route::fallback(function () {
    // 매칭 실패 시 처리
});
```
- 반드시 라우트 파일 마지막에 정의

## Rate Limiting
```php
// 라우트에 적용
Route::middleware('throttle:60,1')->group(function () {
    // 1분당 60회 제한
});
```
- `bootstrap/app.php`의 `withMiddleware()`에서 throttle 설정

## 라우팅 설정 — bootstrap/app.php

### 기본 설정
```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    apiPrefix: 'api/v1',  // API 프리픽스 커스터마이징
)
```

### 추가 라우트 파일 (then)
```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    then: function () {
        Route::middleware('api')
            ->prefix('webhooks')
            ->name('webhooks.')
            ->group(base_path('routes/webhooks.php'));
    },
)
```

### 전체 제어 (using)
```php
->withRouting(
    commands: __DIR__.'/../routes/console.php',
    using: function () {
        Route::middleware('api')->prefix('api')
            ->group(base_path('routes/api.php'));
        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    },
)
```

## 라우트 캐싱
```bash
php artisan route:cache    # 캐시 생성 (프로덕션)
php artisan route:clear    # 캐시 제거
```
- 클로저 라우트는 캐싱 불가 — 반드시 컨트롤러 사용

## 라우트 확인 명령어
```bash
php artisan route:list              # 전체 목록
php artisan route:list -v           # 미들웨어 포함
php artisan route:list --path=api   # 경로 필터
php artisan route:list --except-vendor  # 벤더 제외
```

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| 컨트롤러 사용 | 클로저 라우트 금지 (캐싱 불가) |
| Named Route | 모든 라우트에 이름 지정 |
| RESTful 명명 | `{resource}.{action}` 패턴 |
| Route Model Binding | 수동 `find()` 대신 암시적 바인딩 사용 |
| Form Request | 입력 검증은 Form Request에서 |
| API 버전 관리 | `apiPrefix: 'api/v1'` 사용 |
| 그룹화 | 공통 middleware/prefix는 Route Group으로 |
| CSRF | POST/PUT/PATCH/DELETE 요청에 `@csrf` 필수 (web) |
| 폴백 라우트 | 파일 마지막에 정의 |
| 캐싱 | 프로덕션 배포 시 `route:cache` 실행 |
