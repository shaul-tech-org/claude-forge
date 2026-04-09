---
---

# 조직도 — 명령 체계

## 계층 구조

```
사용자
  └── Coordinator (sonnet) — 모든 요청 접수 + 라우팅
        ├── be-developer (sonnet) — PHP/Laravel 백엔드
        ├── fe-developer (sonnet) — React/TypeScript 프론트엔드
        ├── infra-engineer (sonnet) — Docker, CI/CD
        └── research (sonnet) — 기술 조사/문서화
```

## 보고 라인

| 에이전트 | 상급자 | 역할 |
|---------|--------|------|
| coordinator | 사용자 | 요청 접수, 라우팅 |
| be-developer | coordinator | PHP/Laravel 구현 |
| fe-developer | coordinator | React/TypeScript 구현 |
| infra-engineer | coordinator | Docker, CI/CD |
| research | coordinator | 논문/문서/오픈소스/웹 조사 및 문서화 |

## 원칙
- Coordinator: 라우팅만, 직접 구현 금지
- Developer/Infra/Research: 직접 실행
- 불명확한 작업은 Coordinator에게 에스컬레이션
