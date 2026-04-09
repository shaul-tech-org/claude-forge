---
paths:
  - "**/*.php"
  - "**/Requests/*.php"
  - "**/Rules/*.php"
---

# Laravel 13 Validation 규칙

## 기본 검증
```php
$validated = $request->validate([
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
]);

// 배열 형식
$validated = $request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

### bail — 첫 실패 시 중단
```php
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
]);
```

### 중첩 필드 (점 표기법)
```php
$request->validate([
    'author.name' => 'required',
    'author.description' => 'required',
]);
```

## Form Request (권장)
```bash
php artisan make:request StorePostRequest
```
```php
class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ];
    }

    // 커스텀 에러 메시지
    public function messages(): array
    {
        return [
            'title.required' => 'A title is required',
        ];
    }

    // 커스텀 속성명
    public function attributes(): array
    {
        return ['email' => 'email address'];
    }

    // 입력 전처리
    public function prepareForValidation(): void
    {
        $this->merge(['slug' => Str::slug($this->slug)]);
    }
}
```

### 컨트롤러에서 사용
```php
public function store(StorePostRequest $request): RedirectResponse
{
    $validated = $request->validated();
    $validated = $request->safe()->only(['name', 'email']);
    $validated = $request->safe()->except(['password']);
    return redirect('/posts');
}
```

## 수동 Validator
```php
$validator = Validator::make($request->all(), [
    'title' => 'required|unique:posts|max:255',
    'body' => 'required',
]);

if ($validator->fails()) {
    return redirect('post/create')
        ->withErrors($validator)
        ->withInput();
}

// 추가 검증
$validator->after(function ($validator) {
    if ($this->somethingElseIsInvalid()) {
        $validator->errors()->add('field', 'Something is wrong!');
    }
});
```

## 에러 표시 (Blade)
```blade
@if ($errors->any())
    <ul>
        @foreach ($errors->all() as $error)
            <li>{{ $error }}</li>
        @endforeach
    </ul>
@endif

@error('title')
    <div class="alert">{{ $message }}</div>
@enderror
```

## 배열 검증
```php
$request->validate([
    'person' => 'required|array|min:3',
    'person.name' => 'required|string|max:50',
    'persons.*.email' => 'email|unique:users',
    'persons.*.name' => 'string',
]);
```

## 파일 검증
```php
$request->validate([
    'avatar' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
    'document' => 'mimes:pdf|max:12288',
]);
```

## 비밀번호 검증
```php
use Illuminate\Validation\Rules\Password;

$request->validate([
    'password' => [
        'required', 'confirmed',
        Password::min(8)->letters()->numbers()->symbols()->uncompromised(),
    ],
]);
```

## 커스텀 규칙
```bash
php artisan make:rule Uppercase
```
```php
class Uppercase implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strtoupper($value) !== $value) {
            $fail('The :attribute must be uppercase.');
        }
    }
}

// 사용
$request->validate(['name' => ['required', new Uppercase()]]);
```

### 클로저 규칙
```php
$request->validate([
    'email' => [
        'required',
        function ($attribute, $value, $fail) {
            if ($value === 'test') {
                $fail('The email cannot be test.');
            }
        },
    ],
]);
```

## 주요 규칙 목록

### 문자열/기본
`required`, `nullable`, `string`, `max:N`, `min:N`, `size:N`, `between:min,max`, `in:a,b`, `not_in:a,b`, `regex:/pattern/`

### 조건부
`required_if:field,value`, `required_unless:field,value`, `required_with:field`, `required_without:field`

### 숫자
`numeric`, `integer`, `ip`, `json`, `url`, `uuid`, `ulid`

### 데이터베이스
`exists:table,column`, `unique:table,column`

### 날짜
`date`, `date_format:format`, `before:date`, `after:date`, `before_or_equal:date`, `after_or_equal:date`

### 파일
`file`, `image`, `mimes:ext`, `mimetypes:type`, `max:KB`, `dimensions`

### 기타
`email`, `confirmed`, `bail`, `exclude_if:field,value`

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| Form Request | 모든 검증은 Form Request 클래스에 분리 |
| validated() | 검증 통과 데이터만 `$request->validated()` 사용 |
| 배열 규칙 | `배열 형식` 사용 (파이프보다 가독성 우수) |
| 커스텀 규칙 | 복잡한 검증은 Rule 객체로 분리 |
| 비밀번호 | `Password::min(8)->letters()->numbers()` 패턴 |
| nullable | 선택 필드는 명시적 `nullable` 지정 |
