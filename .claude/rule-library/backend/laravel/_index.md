# Laravel 규칙 라이브러리

> `.claude/rules/backend/laravel/`에 복사된 파일만 Claude Code가 자동 로드합니다.
> `/rules` 스킬로 활성화/비활성화할 수 있습니다.

## 프리셋

### api — API 개발 (권장)
controllers, requests, responses, validation, middleware, routing, errors, eloquent, migration

### web — 웹 풀스택
controllers, requests, responses, validation, middleware, routing, errors, eloquent, migration, views, blade, csrf, session, vite

### minimal — 최소 (DB + 컨트롤러)
controllers, eloquent, migration, validation

## 규칙 목록

| 파일 | 영역 | 설명 |
|------|------|------|
| controllers.md | HTTP | Controller 패턴, Resource/Single Action, Middleware 적용 |
| requests.md | HTTP | Request 입력 처리, 타입별 헬퍼, 파일 업로드 |
| responses.md | HTTP | Response 반환, JSON, 리다이렉트, 스트리밍 |
| validation.md | HTTP | Form Request, 검증 규칙, 커스텀 Rule |
| middleware.md | HTTP | Middleware 생성/등록, Before/After, Terminable |
| routing.md | HTTP | 라우트 정의, 파라미터, 그룹, Model Binding |
| eloquent.md | DB | Eloquent ORM, N+1 방지, Mass Assignment |
| migration.md | DB | Migration up/down, 컬럼 규칙, 외래키 |
| errors.md | 인프라 | Error Handling, 예외 보고/렌더링 |
| logging.md | 인프라 | 로깅 채널, 레벨, 컨텍스트 |
| session.md | 상태 | 세션 읽기/쓰기, Flash, 드라이버 |
| csrf.md | 보안 | CSRF 보호, 토큰, Origin 검증 |
| views.md | 뷰 | Views 생성, Composer, 데이터 전달 |
| blade.md | 뷰 | Blade 템플릿, 컴포넌트, 레이아웃 |
| urls.md | URL | URL 생성, Signed URL, Fluent URI |
| vite.md | 빌드 | Vite 설정, React/Vue, HMR |
