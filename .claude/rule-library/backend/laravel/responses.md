---
paths:
  - "**/*.php"
  - "**/Controllers/*.php"
  - "**/Resources/*.php"
---

# Laravel 13 HTTP Response 규칙

## 기본 응답
```php
// 문자열 → 자동 text/html
return 'Hello World';

// 배열/Eloquent 모델 → 자동 JSON
return [1, 2, 3];
return $user;

// Response 객체
return response('Hello World', 200)
    ->header('Content-Type', 'text/plain');
```

## 헤더
```php
return response($content)
    ->header('Content-Type', $type)
    ->header('X-Header-One', 'Value');

// 다중 헤더
return response($content)->withHeaders([
    'Content-Type' => $type,
    'X-Custom' => 'Value',
]);

// 헤더 제거
return response($content)->withoutHeader('X-Debug');

// Cache Control 미들웨어
Route::middleware('cache.headers:public;max_age=30;etag')->group(fn () => ...);
```

## 쿠키
```php
return response('Hello')->cookie('name', 'value', $minutes);

// 상세 설정
return response('Hello')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);

// 쿠키 만료
return response('Hello')->withoutCookie('name');

// 쿠키 암호화 제외 (bootstrap/app.php)
$middleware->encryptCookies(except: ['cookie_name']);
```

## 리다이렉트
```php
return redirect('/home/dashboard');
return back()->withInput();
return redirect()->route('profile', ['id' => 1]);
return redirect()->route('profile', [$user]);  // Eloquent 모델
return redirect()->action([UserController::class, 'profile'], ['id' => 1]);
return redirect()->away('https://www.google.com');

// Flash 데이터와 함께
return redirect('/dashboard')->with('status', 'Profile updated!');
```

## JSON 응답
```php
return response()->json(['name' => 'Abigail', 'state' => 'CA']);

// JSONP
return response()->json($data)->withCallback($request->input('callback'));
```

## 파일 응답
```php
// 다운로드 강제
return response()->download($pathToFile);
return response()->download($pathToFile, $name, $headers);

// 브라우저에서 표시
return response()->file($pathToFile);
return response()->file($pathToFile, $headers);
```

## 스트리밍 응답
```php
// 스트리밍 JSON
return response()->streamJson([
    ['id' => 1, 'name' => 'User 1'],
    ['id' => 2, 'name' => 'User 2'],
]);

// Event Stream (SSE)
return response()->eventStream(function ($event) {
    $event->data(['message' => 'Hello'], 'message');
});
```

## 뷰 응답
```php
return response()->view('hello', $data, 200)
    ->header('Content-Type', $type);
```

## Response 매크로 — AppServiceProvider
```php
use Illuminate\Support\Facades\Response;

Response::macro('caps', function ($value) {
    return Response::make(strtoupper($value));
});

// 사용: return response()->caps('hello');
```

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| API Resource | API 응답은 API Resource로 포맷 통일 |
| JSON 응답 | API는 `response()->json()` 사용 |
| HTTP 상태 코드 | 적절한 상태 코드 반환 (201, 204, 404 등) |
| 리다이렉트 | Named Route 사용 (`redirect()->route()`) |
| Flash 데이터 | 리다이렉트 시 `with()`로 상태 메시지 전달 |
| 스트리밍 | 대용량 데이터는 `streamJson()` 또는 `eventStream()` |
| 쿠키 암호화 | 기본 암호화 유지, 필요 시만 예외 설정 |
