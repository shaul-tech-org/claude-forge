---
paths:
  - "**/vite.config.*"
  - "**/resources/js/**"
  - "**/resources/css/**"
  - "**/package.json"
---

# Laravel 13 Vite (Asset Bundling) 규칙

## 기본 설정 — vite.config.js
```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel(['resources/css/app.css', 'resources/js/app.js']),
    ],
});
```

### SPA/Inertia (JS만 진입점, CSS는 JS에서 import)
```js
export default defineConfig({
    plugins: [laravel(['resources/js/app.js'])],
});
```
```js
// resources/js/app.js
import '../css/app.css';
```

## React 설정
```bash
npm install --save-dev @vitejs/plugin-react
```
```js
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.jsx']),
        react(),
    ],
});
```
```blade
@viteReactRefresh    {{-- 반드시 @vite 이전에 --}}
@vite('resources/js/app.jsx')
```

## Blade에서 로드
```blade
@vite(['resources/css/app.css', 'resources/js/app.js'])
@vite('resources/js/app.js')
```

## 빌드 명령어
```bash
npm run dev      # 개발 서버 (HMR)
npm run build    # 프로덕션 빌드
```

## Alias
```js
resolve: {
    alias: {
        '@': '/resources/js',  // 기본 alias
    },
},
```
```js
import { Component } from '@/components/MyComponent';
```

## 환경 변수
```env
VITE_API_URL=https://api.example.com
```
```js
const apiUrl = import.meta.env.VITE_API_URL;
```
- `VITE_` 접두사만 클라이언트에 노출

## HTTPS 개발 서버
```js
plugins: [
    laravel({ detectTls: 'my-app.test' }),  // Herd/Valet 자동 감지
],
```

## 테스트에서 비활성화
```xml
<!-- phpunit.xml -->
<env name="VITE_BYPASS_DETECTION" value="true"/>
```

## 필수 규칙 요약

| 규칙 | 설명 |
|------|------|
| React 사용 | `@viteReactRefresh`는 `@vite` 이전에 |
| 환경 변수 | `VITE_` 접두사만 클라이언트 노출 — 비밀값 금지 |
| SPA | CSS는 JS에서 import |
| 프로덕션 | 배포 시 `npm run build` 실행 |
| Node.js | 16 이상 필요 |
