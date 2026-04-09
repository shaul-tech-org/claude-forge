---
paths:
  - "**/views/**/*.blade.php"
  - "**/*.blade.php"
---

# Laravel 13 Blade Templates 규칙

## 데이터 출력
```blade
{{ $name }}                    {{-- XSS 방지 (htmlspecialchars) --}}
{!! $html !!}                  {{-- Raw HTML (사용자 입력 금지) --}}
{{ Js::from($array) }}         {{-- JSON 안전 출력 --}}
@{{ name }}                    {{-- Vue/React 등 JS 프레임워크용 이스케이프 --}}
```

## 조건문
```blade
@if ($condition)
@elseif ($other)
@else
@endif

@unless (Auth::check()) @endunless
@isset($var) @endisset
@empty($var) @endempty

@auth @endauth
@guest @endguest
@auth('admin') @endauth

@production @endproduction
@env('staging') @endenv

@session('status')
    {{ $value }}
@endsession
```

## 반복문
```blade
@for ($i = 0; $i < 10; $i++) @endfor
@foreach ($users as $user) @endforeach
@forelse ($users as $user) @empty <p>No users</p> @endforelse
@while (true) @endwhile

@continue($user->type == 1)
@break($user->number == 5)
```

### $loop 변수
| 속성 | 설명 |
|------|------|
| `$loop->index` | 0부터 시작 |
| `$loop->iteration` | 1부터 시작 |
| `$loop->remaining` | 남은 수 |
| `$loop->count` | 전체 수 |
| `$loop->first` | 첫 반복 |
| `$loop->last` | 마지막 반복 |
| `$loop->even` / `$loop->odd` | 짝수/홀수 |
| `$loop->depth` | 중첩 깊이 |
| `$loop->parent` | 상위 루프 |

## 컴포넌트

### 클래스 기반
```php
// app/View/Components/Alert.php
class Alert extends Component
{
    public function __construct(public string $type = 'info') {}
    public function render() { return view('components.alert'); }
}
```
```blade
<x-alert type="danger">Content</x-alert>
<x-alert :$user :$message />
```

### 익명 컴포넌트 (뷰 파일만)
```blade
{{-- resources/views/components/alert.blade.php --}}
<div class="alert alert-{{ $type }}">{{ $slot }}</div>
```

### 슬롯
```blade
{{-- 기본 슬롯 --}}
{{ $slot }}

{{-- 명명된 슬롯 --}}
<x-card>
    <x-slot:title>Card Title</x-slot:title>
    Body content
    <x-slot:footer>Footer</x-slot:footer>
</x-card>
```

### 동적 컴포넌트
```blade
<x-dynamic-component :component="$componentName" />
```

## 레이아웃

### 템플릿 상속
```blade
{{-- layouts/app.blade.php --}}
@yield('title', 'Default Title')
@yield('content')

{{-- child.blade.php --}}
@extends('layouts.app')
@section('title', 'Page Title')
@section('content') ... @endsection
```

### @parent — 부모 섹션 병합
```blade
@section('content')
    @parent
    <p>추가 내용</p>
@endsection
```

## 폼
```blade
@csrf                          {{-- CSRF 토큰 --}}
@method('PUT')                 {{-- HTTP 메서드 스푸핑 --}}

@error('email')
    <div class="alert">{{ $message }}</div>
@enderror
```

## 스택
```blade
{{-- 레이아웃 --}}
@stack('styles')
@stack('scripts')

{{-- 자식 뷰 --}}
@push('scripts') <script>...</script> @endpush
@prepend('scripts') <script>...</script> @endprepend
```

## 조건부 CSS 클래스
```blade
@class([
    'p-4',
    'bg-red-100' => $hasError,
    'bg-green-100' => !$hasError,
])
```

## 서비스 인젝션
```blade
@inject('metrics', 'App\Services\MetricsService')
{{ $metrics->monthlyRevenue() }}
```

## 커스텀 디렉티브 — AppServiceProvider
```php
Blade::directive('datetime', fn ($expr) =>
    "<?php echo ($expr)->format('m/d/Y H:i'); ?>");

Blade::if('admin', fn () => Auth::user()?->isAdmin());
```

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| XSS 방지 | `{{ }}` 사용, `{!! !!}`는 신뢰된 데이터만 |
| 컴포넌트 우선 | 재사용 UI는 `<x-component>` 패턴 |
| CSRF | 모든 POST/PUT/PATCH/DELETE 폼에 `@csrf` |
| 에러 표시 | `@error` 디렉티브로 검증 에러 표시 |
| 레이아웃 | `@extends` + `@section`으로 상속 |
