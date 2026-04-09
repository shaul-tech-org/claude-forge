# 기여 가이드

claude-forge에 기여해 주셔서 감사합니다. 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 이슈 관리

프로젝트는 [Plane](https://plane.shaul.kr)으로 이슈를 관리합니다.

- **프로젝트 식별자**: `FORGE`
- **이슈 유형**: 기능 요청, 버그 리포트, 문서 개선, 리팩토링
- 이슈 번호는 `FORGE-{번호}` 형식으로 부여됩니다

### 이슈 상태 흐름

```
Backlog → Todo → In Progress → Done
```

- 작업 시작 시 이슈 상태를 **In Progress**로 변경
- 완료 시 **Done**으로 변경하고 결과 요약 코멘트 작성

## 개발 프로세스

### 1. 브랜치 생성

```bash
git checkout -b feature/FORGE-{번호}-{간략한-설명}
```

예시: `feature/FORGE-76-readme-rewrite`

### 2. 커밋 메시지

**한국어**로 작성하며, Google Commit Message Guide 형식을 따릅니다:

```
type(scope): subject

body (선택)
```

| type | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `docs` | 문서 변경 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, CI, 설정 변경 |

예시:
```
feat(backend): 하네스 평가 API 구현
fix(frontend): 캔버스 노드 드래그 오프셋 수정
docs: README.md 피벗 후 재작성
refactor: CLAUDE.md 토큰 최적화 — 중복 섹션 제거
```

### 3. Pull Request

1. 브랜치를 push하고 PR을 생성합니다
2. PR 제목은 커밋 메시지와 동일한 형식을 따릅니다
3. PR 본문에 관련 이슈 번호를 명시합니다 (`FORGE-{번호}`)
4. 리뷰 후 머지합니다

## 코드 스타일

### 백엔드 (PHP 8.4 + Laravel 13)

- **스타일 도구**: PHP Pint (PSR-12 기반)
- **검사**: `cd backend && ./vendor/bin/pint --test`
- **적용**: `cd backend && ./vendor/bin/pint`
- PHP 8.4 기능 활용: readonly properties, enums, match
- 타입 힌팅 필수
- 코드 주석: 영어

### 프론트엔드 (React 19 + TypeScript)

- **스타일 도구**: ESLint
- **검사**: `cd frontend && npx eslint src/`
- TypeScript strict 모드
- `any` 타입 사용 금지
- Tailwind CSS 유틸리티 클래스 사용 (인라인 스타일 금지)
- 코드 주석: 영어

## 테스트

모든 코드 변경에는 테스트가 필요합니다.

| 영역 | 도구 | 실행 명령 |
|------|------|----------|
| 백엔드 | Pest | `cd backend && php artisan test` |
| 프론트엔드 | Vitest | `cd frontend && npx vitest run` |
| E2E | Playwright | `npx playwright test` |

## 하네스 구성 변경 시 주의사항

`.claude/` 디렉토리의 하네스 구성을 변경할 때는 다음을 확인하세요:

| 변경 대상 | 확인 사항 |
|----------|----------|
| `.claude/agents/` 추가/수정 | coordinator 라우팅 테이블 및 `tools: Agent(...)` 동기화 |
| `.claude/skills/` 추가 | 스킬이 올바르게 로드되는지 `/skills`로 확인 |
| `.claude/rules/` 추가 | `paths` frontmatter로 조건부 로딩 대상 지정 |
| `org-chart.md` | 에이전트 추가/제거 시 조직도 갱신 |

## 프로젝트 구조

자세한 개발 환경 설정은 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)를 참조하세요.

## 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE)로 제공됩니다. 기여하신 코드도 동일한 라이선스가 적용됩니다.
