---
paths:
  - "**/*.php"
  - "**/Requests/*.php"
---

# Laravel 13 HTTP Request 규칙

## Request 접근
```php
// 컨트롤러 메서드 주입
public function store(Request $request): RedirectResponse
{
    $name = $request->input('name');
}

// 라우트 파라미터와 함께
public function update(Request $request, string $id): RedirectResponse
{
    // Request + 라우트 파라미터 모두 접근 가능
}
```

## 경로/URL/메서드 정보
```php
$request->path();              // 'foo/bar' (쿼리 제외)
$request->url();               // 쿼리 스트링 제외
$request->fullUrl();           // 쿼리 스트링 포함
$request->fullUrlWithQuery(['type' => 'phone']);
$request->fullUrlWithoutQuery(['type']);
$request->method();            // 'GET', 'POST' 등
$request->isMethod('post');    // boolean
$request->is('admin/*');       // 경로 패턴 매칭
$request->routeIs('admin.*'); // Named 라우트 매칭
```

## 헤더
```php
$request->header('X-Header-Name');
$request->header('X-Header-Name', 'default');
$request->hasHeader('X-Header-Name');
$request->bearerToken();       // Authorization Bearer 토큰
```

## Input 처리

### 기본
```php
$request->all();               // 전체 input 배열
$request->collect();           // Collection 반환
$request->input('name');
$request->input('name', 'default');
$request->input('products.0.name');  // 점 표기법
$request->input('products.*.name'); // 와일드카드
$request->query('name');       // 쿼리 스트링만
```

### 타입별 처리
```php
$request->string('name')->trim();    // Stringable
$request->integer('per_page', 15);   // 정수
$request->boolean('archived');        // 1/"1"/true/"true"/"on"/"yes" → true
$request->array('versions');          // 배열 (없으면 [])
$request->date('birthday');           // Carbon
$request->date('elapsed', '!H:i', 'Europe/Madrid');
```

### 존재 여부
```php
$request->has('name');          // 존재하고 비어있지 않음
$request->has(['name', 'email']); // 모든 키 존재
$request->hasAny(['name', 'title']); // 어느 하나 존재
$request->filled('name');       // 존재하고 비어있지 않음
$request->missing('name');      // 없거나 비어있음
```

### 병합
```php
$request->merge(['votes' => 0]);
$request->mergeIfMissing(['votes' => 0]);
```

## Content Negotiation
```php
$request->accepts(['text/html', 'application/json']);
$request->prefers(['text/html', 'application/json']);
$request->expectsJson();        // JSON 응답 기대 여부
```

## 파일 업로드
```php
$file = $request->file('photo');
$request->hasFile('photo');

// 저장
$path = $request->file('photo')->store('photos');
$path = $request->file('photo')->store('photos', 's3');
$path = $request->file('photo')->storeAs('photos', 'filename.jpg');

// 파일 정보
$file->getClientOriginalName();
$file->getClientOriginalExtension();
$file->getClientMimeType();
$file->getSize();
```

## Old Input (이전 입력)
```php
$request->old('name');          // Flash에서 이전 값
// Blade: {{ old('name') }}
```

## 쿠키
```php
$request->cookie('name');
$request->cookie('name', 'default');
```

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| 타입별 헬퍼 | `string()`, `integer()`, `boolean()` 등 타입 안전 메서드 사용 |
| 점 표기법 | 중첩 데이터는 `input('a.b.c')` 형식 |
| Form Request | 검증 로직은 Form Request에 분리 |
| 파일 저장 | `store()` 메서드로 디스크에 저장 |
| expectsJson | API 응답 분기 시 `expectsJson()` 활용 |
| IP 주의 | `$request->ip()`는 신뢰할 수 없는 입력 — 정보 목적만 |
