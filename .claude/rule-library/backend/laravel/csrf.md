---
paths:
  - "**/*.php"
  - "**/*.blade.php"
  - "**/bootstrap/app.php"
---

# Laravel 13 CSRF Protection 규칙

## 개념
- Cross-Site Request Forgery 방어
- `PreventRequestForgery` 미들웨어 (web 그룹 기본 포함)

## 2계층 보호

### 1단계: Origin Verification (Sec-Fetch-Site 헤더)
- 최신 브라우저 자동 지원
- same-origin 요청은 토큰 검증 없이 허용
- HTTPS 필수

### 2단계: CSRF Token Validation (폴백)
- Origin 검증 실패 시 전통적 토큰 검증
- 세션별 고유 토큰 생성

## 토큰 적용

### Blade 폼
```blade
<form method="POST" action="/profile">
    @csrf
    <!-- 또는 수동 -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

### AJAX — Meta 태그 방식
```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```
```javascript
$.ajaxSetup({
    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
});
```

### X-XSRF-TOKEN — 쿠키 방식
- Laravel이 모든 응답에 암호화된 `XSRF-TOKEN` 쿠키 자동 포함
- Axios, Angular — 자동 감지 및 전송
- jQuery — 수동 설정 필요

## Origin-Only 모드 (HTTPS 환경)
```php
// bootstrap/app.php
$middleware->preventRequestForgery(originOnly: true);
```
- 토큰 검증 비활성화, Origin 검증만 사용
- HTTPS 필수

## Same-Site 요청 허용 (서브도메인)
```php
$middleware->preventRequestForgery(allowSameSite: true);
```

## URI 제외
```php
// bootstrap/app.php
$middleware->preventRequestForgery(except: [
    'stripe/*',
    'http://example.com/foo/*',
]);
```
- Webhook, 써드파티 콜백 등에 사용

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| @csrf | 모든 POST/PUT/PATCH/DELETE 폼에 필수 |
| HTTPS | Origin 검증을 위해 HTTPS 사용 권장 |
| Webhook 제외 | 외부 서비스 콜백은 `except`에 등록 |
| SPA | Sanctum 사용 — XSRF-TOKEN 쿠키 자동 처리 |
| 테스트 | 테스트 실행 중 자동 비활성화 |
| Meta 태그 | AJAX 사용 시 meta 태그로 토큰 노출 |
