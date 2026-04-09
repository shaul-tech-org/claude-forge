---
paths:
  - "**/*.php"
  - "**/views/**/*.blade.php"
---

# Laravel 13 Views 규칙

## 뷰 생성
```bash
php artisan make:view greeting
```
- 저장 위치: `resources/views/`
- 점 표기법으로 중첩 뷰 참조: `view('admin.profile')` → `resources/views/admin/profile.blade.php`
- 디렉토리 이름에 `.` 사용 금지

## 뷰 반환
```php
// 헬퍼 함수
return view('greeting', ['name' => 'James']);

// 파사드
return View::make('greeting', ['name' => 'James']);

// 첫 번째 존재하는 뷰
return View::first(['custom.admin', 'admin'], $data);

// 존재 여부 확인
if (View::exists('admin.profile')) { /* ... */ }
```

## 데이터 전달
```php
// 배열
return view('greeting', ['name' => 'Victoria']);

// with() 체이닝
return view('greeting')
    ->with('name', 'Victoria')
    ->with('occupation', 'Astronaut');

// 모든 뷰에 공유 (AppServiceProvider::boot)
View::share('key', 'value');
```

## View Composer — 뷰별 데이터 자동 주입
```php
// AppServiceProvider::boot()
View::composer('profile', ProfileComposer::class);
View::composer(['profile', 'dashboard'], MultiComposer::class);
View::composer('*', fn (View $view) => ...);  // 모든 뷰

// Composer 클래스
class ProfileComposer
{
    public function __construct(protected UserRepository $users) {}

    public function compose(View $view): void
    {
        $view->with('count', $this->users->count());
    }
}
```

## View Creator — 인스턴스화 직후 실행
```php
View::creator('profile', ProfileCreator::class);
```
- Composer: 렌더링 직전 실행
- Creator: 인스턴스화 직후 실행

## 캐싱
```bash
php artisan view:cache    # 사전 컴파일 (프로덕션)
php artisan view:clear    # 캐시 제거
```

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| 점 표기법 | 중첩 뷰는 점으로 참조 (`admin.profile`) |
| Composer 활용 | 공통 데이터는 View Composer로 주입 |
| View::share 주의 | 전역 공유는 최소한으로 |
| 프로덕션 캐싱 | 배포 시 `view:cache` 실행 |
