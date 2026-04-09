---
---

# 조직도 — 명령 체계

```
사용자
  └── Coordinator (sonnet) — 라우팅만, 직접 구현 금지
        ├── be-developer (sonnet) — PHP/Laravel 백엔드
        ├── fe-developer (sonnet) — React/TypeScript 프론트엔드
        ├── infra-engineer (sonnet) — Docker, CI/CD
        └── research (sonnet) — 기술 조사/문서화
```

- 불명확한 작업은 Coordinator에게 에스컬레이션
