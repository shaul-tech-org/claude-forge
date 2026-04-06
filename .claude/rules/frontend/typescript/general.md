---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/tsconfig.json"
---

# TypeScript 규칙

## 코딩 표준
- strict 모드 필수
- `any` 사용 금지
- union type 또는 제네릭으로 타입 안전성 확보
- `as` 타입 캐스팅 최소화

## 네이밍
- 변수/함수: camelCase
- 클래스/인터페이스/타입: PascalCase
- 상수: SCREAMING_SNAKE_CASE

## 비동기
- async/await 사용 (.then 체인 지양)
- 병렬 가능한 작업은 `Promise.all()` 사용
