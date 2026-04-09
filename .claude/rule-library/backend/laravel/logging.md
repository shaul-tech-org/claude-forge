---
paths:
  - "**/*.php"
  - "**/config/logging.php"
---

# Laravel 13 Logging 규칙

## 설정
- 파일: `config/logging.php`
- Monolog 기반, 다중 채널 지원

## 채널 드라이버

| 드라이버 | 설명 |
|---------|------|
| `stack` | 다중 채널 조합 |
| `single` | 단일 파일 |
| `daily` | 매일 로테이션 파일 |
| `slack` | Slack 웹훅 |
| `syslog` | 시스템 로그 |
| `errorlog` | PHP 에러 로그 |
| `monolog` | Monolog 핸들러 |
| `custom` | 팩토리 기반 커스텀 |
| `papertrail` | Papertrail 서비스 |

## 채널 설정 예시
```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['daily', 'slack'],
        'ignore_exceptions' => false,
    ],
    'daily' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 14,
    ],
    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'level' => 'critical',
    ],
],
```

## 로그 레벨 (RFC 5424, 심각도 순)
1. `emergency` — 시스템 사용 불가
2. `alert` — 즉각 조치 필요
3. `critical` — 치명적 오류
4. `error` — 일반 오류
5. `warning` — 경고
6. `notice` — 주목
7. `info` — 정보
8. `debug` — 디버그

## 로그 작성
```php
use Illuminate\Support\Facades\Log;

Log::emergency($message);
Log::alert($message);
Log::critical($message);
Log::error($message);
Log::warning($message);
Log::notice($message);
Log::info($message);
Log::debug($message);

// 컨텍스트 정보
Log::info('User {id} failed to login.', ['id' => $user->id]);

// 특정 채널
Log::channel('slack')->info('Something happened!');

// 여러 채널
Log::stack(['single', 'slack'])->info('Something happened!');
```

## 컨텍스트 정보
```php
// 채널별 컨텍스트
Log::withContext(['request-id' => $requestId]);

// 전역 컨텍스트 (모든 채널)
Log::shareContext(['request-id' => $requestId, 'user-id' => $userId]);
```

### 미들웨어에서 Request ID 추가
```php
class AssignRequestId
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();
        Log::shareContext(['request-id' => $requestId]);
        $response = $next($request);
        $response->headers->set('Request-Id', $requestId);
        return $response;
    }
}
```

## On-Demand 채널
```php
Log::build([
    'driver' => 'single',
    'path' => storage_path('logs/custom.log'),
])->info('Custom log message');
```

## 커스텀 채널 — 팩토리
```php
// config/logging.php
'custom' => [
    'driver' => 'custom',
    'via' => App\Logging\CustomLoggerFactory::class,
],
```
```php
class CustomLoggerFactory
{
    public function __invoke(array $config): Logger
    {
        $logger = new Logger('custom');
        $logger->pushHandler(new StreamHandler(storage_path('logs/custom.log')));
        return $logger;
    }
}
```

## Deprecation 경고
```php
'deprecations' => [
    'channel' => env('LOG_DEPRECATIONS_CHANNEL', null),
    'trace' => env('LOG_DEPRECATIONS_TRACE', false),
],
```

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| 레벨 구분 | 적절한 로그 레벨 사용 (error ≠ warning) |
| 컨텍스트 | 로그에 관련 데이터 포함 (`['id' => $id]`) |
| 채널 분리 | 중요도에 따라 채널 분리 (daily + slack) |
| Request ID | 미들웨어에서 `shareContext()` 설정 |
| 프로덕션 | `LOG_LEVEL=warning` 이상 권장 |
| 민감 정보 | 비밀번호, 토큰 등 로그에 기록 금지 |
