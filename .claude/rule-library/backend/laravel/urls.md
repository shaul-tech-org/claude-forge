---
paths:
  - "**/*.php"
---

# Laravel 13 URL Generation 규칙

## 기본 URL 생성
```php
$url = url('/posts/1');                          // http://example.com/posts/1
$url = url()->query('/posts', ['search' => 'Laravel']); // ?search=Laravel
$url = url()->current();                         // 현재 URL (쿼리 제외)
$url = url()->full();                            // 현재 URL (쿼리 포함)
$url = url()->previous();                        // 이전 URL
$url = url()->previousPath();                    // 이전 경로
```

## Named Route URL
```php
$url = route('post.show', ['post' => 1]);
$url = route('post.show', ['post' => $post]);    // Eloquent 모델 자동 키 추출
$url = route('post.show', ['post' => 1, 'search' => 'rocket']); // 추가 파라미터 → 쿼리 스트링
```

## Signed URL (서명된 URL)
```php
use Illuminate\Support\Facades\URL;

// 영구 서명
$url = URL::signedRoute('unsubscribe', ['user' => 1]);

// 임시 서명 (만료 시간)
$url = URL::temporarySignedRoute('unsubscribe', now()->addMinutes(30), ['user' => 1]);

// 검증
$request->hasValidSignature();
$request->hasValidSignatureWhileIgnoring(['page', 'order']);

// 미들웨어로 검증
Route::post('/unsubscribe/{user}', ...)->middleware('signed');
```

### 잘못된 서명 처리 — bootstrap/app.php
```php
use Illuminate\Routing\Exceptions\InvalidSignatureException;

$exceptions->render(function (InvalidSignatureException $e) {
    return response()->view('errors.link-expired', status: 403);
});
```

## Controller Action URL
```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
$url = action(InvokableController::class);
```

## Fluent URI 객체
```php
use Illuminate\Support\Uri;

$uri = Uri::of('https://example.com/path');
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);

// 수정
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

## 기본값 설정
```php
// 미들웨어에서 반복 파라미터 기본값 설정
URL::defaults(['locale' => $request->user()?->locale ?? 'en']);

// 이후 route() 호출 시 locale 생략 가능
route('post.index'); // /{locale}/posts
```

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| Named Route 우선 | `route()` 사용, 하드코딩 URL 금지 |
| Signed URL | 보안 링크는 `signedRoute()` / `temporarySignedRoute()` |
| Eloquent 모델 | `route('name', [$model])` — 자동 키 추출 |
| URL 기본값 | 반복 파라미터는 `URL::defaults()` 설정 |
