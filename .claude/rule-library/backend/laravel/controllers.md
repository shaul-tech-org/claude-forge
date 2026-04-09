---
paths:
  - "**/*.php"
  - "**/Controllers/*.php"
---

# Laravel 13 Controller 규칙

## 생성
```bash
php artisan make:controller UserController
php artisan make:controller ProvisionServer --invokable
php artisan make:controller PhotoController --resource
php artisan make:controller PhotoController --model=Photo --resource --requests
```

## 기본 구조
```php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    public function show(string $id): View
    {
        return view('user.profile', ['user' => User::findOrFail($id)]);
    }
}
```
- 기본 클래스 확장은 선택사항
- public 메서드만 라우트 핸들러로 호출 가능

## Single Action Controller
```php
class ProvisionServer extends Controller
{
    public function __invoke()
    {
        // 단일 복잡 액션 전용
    }
}

// 라우트 등록 시 메서드명 불필요
Route::post('/server', ProvisionServer::class);
```

## Resource Controller

### 생성되는 액션
| HTTP | URI | 메서드 | 라우트명 |
|------|-----|--------|---------|
| GET | `/photos` | index | photos.index |
| GET | `/photos/create` | create | photos.create |
| POST | `/photos` | store | photos.store |
| GET | `/photos/{photo}` | show | photos.show |
| GET | `/photos/{photo}/edit` | edit | photos.edit |
| PUT/PATCH | `/photos/{photo}` | update | photos.update |
| DELETE | `/photos/{photo}` | destroy | photos.destroy |

### 라우트 등록
```php
Route::resource('photos', PhotoController::class);

// 부분 리소스
Route::resource('photos', PhotoController::class)->only(['index', 'show']);
Route::resource('photos', PhotoController::class)->except(['create', 'edit']);

// 중첩 리소스
Route::resource('posts.comments', CommentController::class);

// Soft Delete 지원
Route::resource('photos', PhotoController::class)->withTrashed(['show']);

// Singleton (ID 없음)
Route::singleton('profile', ProfileController::class);
```

## 의존성 주입

### 생성자 주입
```php
class UserController extends Controller
{
    public function __construct(private UserService $userService) {}
}
```

### 메서드 주입
```php
public function store(Request $request, UserService $userService)
{
    // Request + 서비스 + Route 파라미터 모두 주입 가능
}
```

## Middleware 적용

### 방법 1: 라우트에서
```php
Route::get('/profile', [UserController::class, 'show'])->middleware('auth');
```

### 방법 2: HasMiddleware 인터페이스
```php
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('log', only: ['index']),
            new Middleware('subscribed', except: ['store']),
        ];
    }
}
```

### 방법 3: Attribute (권장)
```php
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Routing\Attributes\Controllers\Authorize;

#[Middleware('auth')]
class UserController
{
    #[Middleware('log')]
    #[Authorize('create', [Comment::class, 'post'])]
    public function store(Post $post) { /* ... */ }
}
```

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| Thin Controller | 요청 → Service 호출 → 응답 반환만 |
| 비즈니스 로직 금지 | Service 레이어에 위임 |
| Route Model Binding | 수동 `find()` 대신 타입 힌트 |
| Form Request | 입력 검증은 Form Request에서 |
| API Resource | 응답 포맷은 API Resource로 통일 |
| Single Action | 복잡한 단일 작업은 `__invoke()` 사용 |
| Resource Controller | 표준 CRUD는 Resource Controller 사용 |
