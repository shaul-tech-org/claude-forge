---
paths:
  - "**/*.php"
  - "**/bootstrap/app.php"
  - "**/Exceptions/*.php"
---

# Laravel 13 Error Handling 규칙

## 설정 위치
- `bootstrap/app.php`의 `withExceptions()` 메서드에서 모든 예외 처리 관리
- `APP_DEBUG=true` (개발) / `APP_DEBUG=false` (프로덕션)
- 프로덕션에서 `APP_DEBUG=true` 금지 — 민감 정보 노출

## 예외 보고 (Reporting)

### 커스텀 보고 등록
```php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->report(function (InvalidOrderException $e) {
        // 외부 서비스(Sentry, Flare)로 전송
    });
})
```

### 기본 로깅 중단
```php
$exceptions->report(function (InvalidOrderException $e) {
    // ...
})->stop();

// 또는 false 반환
$exceptions->report(function (InvalidOrderException $e) {
    return false;
});
```

### 전역 컨텍스트
```php
$exceptions->context(fn () => [
    'user_id' => auth()->id(),
    'request_id' => request()->id(),
]);
```

### 예외별 컨텍스트
```php
class InvalidOrderException extends Exception
{
    public function context(): array
    {
        return ['order_id' => $this->orderId];
    }
}
```

### report() 헬퍼 — 예외 보고 후 계속 실행
```php
try {
    // ...
} catch (Throwable $e) {
    report($e);
    return false;
}
```

### 로그 레벨 설정
```php
$exceptions->level(PDOException::class, LogLevel::CRITICAL);
```

### 예외 무시
```php
$exceptions->dontReport([InvalidOrderException::class]);

// 또는 인터페이스 구현
class PodcastException extends Exception implements ShouldntReport {}

// 조건부 무시
$exceptions->dontReportWhen(function (Throwable $e) {
    return $e instanceof PodcastException && $e->reason() === 'expired';
});

// 중복 예외 제거
$exceptions->dontReportDuplicates();
```

## 예외 렌더링 (Rendering)

### 커스텀 렌더링
```php
$exceptions->render(function (InvalidOrderException $e, Request $request) {
    return response()->view('errors.invalid-order', status: 500);
});
```

### API 전용 렌더링
```php
$exceptions->render(function (NotFoundHttpException $e, Request $request) {
    if ($request->is('api/*')) {
        return response()->json(['message' => 'Record not found.'], 404);
    }
});
```

### JSON/HTML 자동 선택
```php
$exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
    return $request->is('api/*') || $request->expectsJson();
});
```

### 전체 응답 커스터마이징
```php
$exceptions->respond(function (Response $response) {
    if ($response->getStatusCode() === 419) {
        return back()->with(['message' => 'Session expired.']);
    }
    return $response;
});
```

## 커스텀 예외 클래스
```php
class InvalidOrderException extends Exception
{
    public function report(): void
    {
        // 보고 로직
    }

    public function render(Request $request): Response
    {
        return response()->view('errors.invalid-order', status: 500);
    }
}
```

## HTTP 에러 페이지
- 위치: `resources/views/errors/{code}.blade.php`
- 예: `errors/404.blade.php`, `errors/500.blade.php`

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| 설정 위치 | `bootstrap/app.php`의 `withExceptions()` |
| 프로덕션 | `APP_DEBUG=false` 필수 |
| API 렌더링 | `api/*` 요청은 JSON 응답 |
| 컨텍스트 | 전역 + 예외별 컨텍스트 정보 추가 |
| 커스텀 예외 | `report()`, `render()`, `context()` 메서드 활용 |
| 로그 레벨 | 예외 유형별 적절한 레벨 설정 |
| 중복 제거 | `dontReportDuplicates()` 활성화 |
