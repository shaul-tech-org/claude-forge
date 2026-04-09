---
---

# 조직도 — 명령 체계

```
사용자
  ├── pm-agent (sonnet) — 이슈 분해, 스프린트 관리, 진행 보고
  └── Coordinator (sonnet) — 라우팅만, 직접 구현 금지
        ├── be-developer (sonnet) — PHP/Laravel 백엔드
        ├── fe-developer (sonnet) — React/TypeScript 프론트엔드
        ├── infra-engineer (sonnet) — Docker, CI/CD
        └── research (sonnet) — 기술 조사/문서화
```

- pm-agent: 프로젝트 관리 전담, 코드 작성 금지
- 불명확한 작업은 Coordinator에게 에스컬레이션
