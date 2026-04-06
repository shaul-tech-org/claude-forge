---
paths:
  - "**/*.tsx"
  - "**/*.ts"
  - "**/package.json"
---

# React 규칙

## 구조
```
src/
├── components/    # 재사용 컴포넌트
├── pages/         # 페이지 컴포넌트
├── hooks/         # 커스텀 훅
├── api/           # API 클라이언트
├── types/         # TypeScript 타입
└── lib/           # 유틸리티
```

## 패턴
- 함수형 컴포넌트 + Hooks
- Custom Hooks으로 로직 분리
- Props: TypeScript interface 정의
- 상태: useState (로컬) / TanStack Query (서버)

## React Flow (드래그 앤 드롭)
- 커스텀 노드는 `memo()`로 감싸서 불필요한 리렌더링 방지
- 노드 데이터 변경은 `useNodesState` / `setNodes` 사용
- 엣지 타입별 스타일 분리

## 테스트
- Vitest + React Testing Library
- 컴포넌트 단위 테스트
