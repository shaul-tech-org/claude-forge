---
paths:
  - "**/*.php"
  - "**/bootstrap/app.php"
  - "**/Middleware/*.php"
---

# Laravel 13 Middleware 규칙

## 생성
```bash
php artisan make:middleware EnsureTokenIsValid
```
- 생성 위치: `app/Http/Middleware/`
- Service Container 통해 해석 — 생성자에서 의존성 주입 가능

## 기본 구조
```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTokenIsValid
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->input('token') !== 'my-secret-token') {
            return redirect('/home');
        }

        return $next($request);
    }
}
```

## Before / After Middleware

### Before — 요청 전 처리
```php
public function handle(Request $request, Closure $next): Response
{
    // 요청 도달 전 실행
    return $next($request);
}
```

### After — 응답 후 처리
```php
public function handle(Request $request, Closure $next): Response
{
    $response = $next($request);
    // 응답 생성 후 실행
    return $response;
}
```

## 등록 — bootstrap/app.php

### Global Middleware (모든 요청)
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->append(EnsureTokenIsValid::class);   // 뒤에 추가
    $middleware->prepend(EnsureTokenIsValid::class);  // 앞에 추가
})
```

### Web / API 그룹 수정
```php
->withMiddleware(function (Middleware $middleware): void {
    // 추가
    $middleware->web(append: [EnsureUserIsSubscribed::class]);
    $middleware->api(prepend: [EnsureTokenIsValid::class]);

    // 교체
    $middleware->web(replace: [
        StartSession::class => StartCustomSession::class,
    ]);

    // 제거
    $middleware->web(remove: [StartSession::class]);
})
```

### Alias 정의
```php
$middleware->alias([
    'subscribed' => EnsureUserIsSubscribed::class,
    'admin' => EnsureUserIsAdmin::class,
]);
```

### 커스텀 그룹
```php
$middleware->appendToGroup('custom-group', [First::class, Second::class]);
$middleware->prependToGroup('custom-group', [First::class]);
```

## 라우트 적용

### 개별 라우트
```php
Route::get('/profile', function () {
    // ...
})->middleware(EnsureTokenIsValid::class);

// 복수
Route::get('/', function () {
    // ...
})->middleware([First::class, Second::class]);

// Alias 사용
Route::get('/profile', fn () => ...)->middleware('subscribed');
```

### 그룹 적용
```php
Route::middleware(['auth', 'verified'])->group(function () {
    // ...
});
```

### 제외 (withoutMiddleware)
```php
// 개별 라우트에서 제외
Route::middleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', fn () => ...)
        ->withoutMiddleware([EnsureTokenIsValid::class]);
});

// 그룹 전체에서 제외
Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    // ...
});
```
- `withoutMiddleware()`는 라우트 미들웨어만 제거 가능 — Global 미들웨어는 제거 불가

## Middleware Parameters
```php
// 라우트에서 콜론으로 파라미터 전달
Route::get('/admin', fn () => ...)->middleware('role:admin,editor');
```
```php
// Middleware 구현
public function handle(Request $request, Closure $next, string $role, string $secondRole): Response
{
    if (! in_array(auth()->user()->role, [$role, $secondRole])) {
        return redirect('/');
    }
    return $next($request);
}
```

## Terminable Middleware
```php
class LogRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    // 응답이 브라우저에 전송된 후 실행
    public function terminate(Request $request, Response $response): void
    {
        // 로깅 등 후처리
    }
}
```

## 기본 제공 Middleware

### Global (bootstrap/app.php)
| Middleware | 역할 |
|-----------|------|
| `InvokeDeferredCallbacks` | 지연 콜백 실행 |
| `TrustProxies` | 프록시 신뢰 |
| `HandleCors` | CORS 처리 |
| `PreventRequestsDuringMaintenance` | 유지보수 모드 차단 |
| `ValidatePostSize` | POST 크기 검증 |
| `TrimStrings` | 문자열 공백 제거 |
| `ConvertEmptyStringsToNull` | 빈 문자열 → null |

### Web 그룹
| Middleware | 역할 |
|-----------|------|
| `EncryptCookies` | 쿠키 암호화 |
| `AddQueuedCookiesToResponse` | 대기 쿠키 응답 추가 |
| `StartSession` | 세션 시작 |
| `ShareErrorsFromSession` | 세션 오류 → 뷰 공유 |
| `PreventRequestForgery` | CSRF 보호 |
| `SubstituteBindings` | Route Model Binding |

### API 그룹
| Middleware | 역할 |
|-----------|------|
| `SubstituteBindings` | Route Model Binding |

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| 설정 위치 | `bootstrap/app.php`의 `withMiddleware()`에서 관리 |
| 타입 힌팅 | `handle()` 반환 타입 `Response` 명시 |
| 단일 책임 | 미들웨어 하나당 하나의 관심사 |
| Alias 사용 | 반복 사용 미들웨어는 alias 등록 후 문자열로 참조 |
| 파라미터 | 콜론(`:`) 구분, `handle()` 메서드 인자로 수신 |
| Global 주의 | Global 등록은 성능 영향 — 꼭 필요한 경우만 |
| withoutMiddleware 제한 | Global 미들웨어는 라우트에서 제외 불가 |
| Terminable | 후처리 로직은 `terminate()` 메서드 활용 |
| 의존성 주입 | 생성자 주입 가능 (Service Container 해석) |
