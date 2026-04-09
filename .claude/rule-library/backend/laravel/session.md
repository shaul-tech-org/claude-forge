---
paths:
  - "**/*.php"
  - "**/config/session.php"
---

# Laravel 13 Session 규칙

## 설정
- 파일: `config/session.php`
- 드라이버: `file`, `cookie`, `database`, `memcached`, `redis`, `dynamodb`, `array`

### Database 드라이버 설정
```bash
php artisan make:session-table
php artisan migrate
```

## 데이터 읽기
```php
// Request 인스턴스
$value = $request->session()->get('key');
$value = $request->session()->get('key', 'default');
$data = $request->session()->all();
$data = $request->session()->only(['username', 'email']);
$data = $request->session()->except(['password']);

// 헬퍼 함수
$value = session('key');
$value = session('key', 'default');
```

### 존재 여부
```php
$request->session()->has('key');      // null 아닌 값 존재
$request->session()->exists('key');   // null이어도 키 존재
$request->session()->missing('key');  // 키 없음
```

## 데이터 쓰기
```php
$request->session()->put('key', 'value');
session(['key' => 'value']);

// 배열에 추가
$request->session()->push('user.teams', 'developers');

// 조회 후 삭제
$value = $request->session()->pull('key', 'default');

// 증감
$request->session()->increment('count');
$request->session()->increment('count', 2);
$request->session()->decrement('count');
```

## Flash 데이터 — 다음 요청에만 유효
```php
$request->session()->flash('status', 'Task was successful!');
$request->session()->now('status', 'Current request only');

// Flash 유지
$request->session()->reflash();
$request->session()->keep(['username', 'email']);
```

## 삭제
```php
$request->session()->forget('name');
$request->session()->forget(['name', 'status']);
$request->session()->flush();        // 전체 삭제
```

## 세션 ID 재생성 — 보안
```php
$request->session()->regenerate();    // ID만 재생성 (데이터 유지)
$request->session()->invalidate();   // ID 재생성 + 데이터 삭제
```
- Session Fixation 방지
- Laravel은 인증 시 자동 재생성

## 세션 캐시
```php
$discount = $request->session()->cache()->get('discount');
$request->session()->cache()->put('discount', 10, now()->addMinutes(5));
```

## 세션 블로킹 — 동시 요청 순차 처리
```php
Route::post('/profile', fn () => ...)->block($lockSeconds = 10, $waitSeconds = 10);
```
- `cookie` 드라이버 불가
- 잠금 실패 시 `LockTimeoutException`

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| 드라이버 | 프로덕션은 `redis` 또는 `database` 권장 |
| Flash 데이터 | 상태 메시지는 `flash()` 사용 |
| 보안 | 인증 후 `regenerate()` (자동 처리됨) |
| API | API는 세션 불필요 — 토큰 기반 인증 사용 |
| 블로킹 | 동시 쓰기 경합 시 `block()` 사용 |
