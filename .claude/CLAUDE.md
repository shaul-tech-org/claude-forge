# claude-forge

> Harness Engineering Platform — AI 하네스를 설계·구축·평가하는 도구

## 제품 정의

Claude Code 사용자가 자신의 작업 방식에 맞는 AI 하네스를
설계/구축/평가/진화할 수 있는 웹 플랫폼.
이 프로젝트 자체가 첫 번째 showcase.

## 핵심 개념: 6축 프레임워크

1. **Context Engineering** — 모델에 전달되는 정보의 질과 양
2. **Verification Loops** — 출력물의 자동 검증
3. **State Management** — 세션 간 학습과 기억
4. **Tool Orchestration** — 도구 호출의 최적 조합
5. **Human-in-the-Loop** — 위험 결정의 사람 개입
6. **Lifecycle Management** — 이벤트 기반 자동화

## 기술 스택

- 백엔드: PHP 8.4 + Laravel 13
- 프론트엔드: TypeScript + React 19 + React Flow 12 + Tailwind CSS 4
- DB: PostgreSQL 18
- 인프라: Docker Compose
