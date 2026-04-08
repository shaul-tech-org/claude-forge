---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
  - "frontend/src/**/*.test.ts"
  - "frontend/src/**/*.test.tsx"
---

# 프론트엔드 테스트 규칙

## 테스트 프레임워크
- Vitest + React Testing Library
- jsdom 환경

## 테스트 구조
- 테스트 파일: 대상 파일과 같은 디렉토리에 `{파일명}.test.ts(x)`
- 컴포넌트 테스트: 사용자 관점 (렌더링, 인터랙션)
- 훅 테스트: `renderHook` 사용

## 작성 원칙
- 새로운 컴포넌트/훅 작성 시 테스트 필수
- `screen.getByRole`, `screen.getByText` 등 접근성 쿼리 우선
- 구현 세부사항(state, ref)이 아닌 동작 테스트
- 모킹은 외부 의존성(API 호출)에만 사용

## CI 연동
- `npx vitest run`으로 실행
- 테스트 실패 시 CI 파이프라인 중단
