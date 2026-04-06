# PRD: claude-forge

## 1. 개요

### 제품명
claude-forge

### 한 줄 설명
Claude Code의 `.claude` 설정을 지능적으로 생성하고 최적화하는 드래그 앤 드롭 빌더.

### 배경
Claude Code는 `.claude/` 디렉토리 내의 설정 파일들(에이전트, 스킬, 규칙)을 통해 프로젝트별 행동을 커스터마이징한다. 그러나 이 설정을 만들려면 디렉토리 구조, YAML frontmatter, 마크다운 포맷, 에이전트 간 관계, 규칙의 glob 패턴 등을 모두 이해해야 한다.

### 문제
1. **높은 진입 장벽**: .claude 구조와 파일 포맷을 알아야 설정 가능
2. **연관 지식 부재**: "Laravel을 쓴다"면 Eloquent, Migration, Blade 등 연관 규칙이 필요한데 이를 스스로 파악해야 함
3. **실전 패턴 누락**: N+1 문제, SQL Injection 방지 같은 실전 규칙을 빠뜨리기 쉬움
4. **조합의 어려움**: 에이전트 ↔ 스킬 ↔ 규칙 간 관계를 시각적으로 파악하기 어려움

### 목표
- 드래그 앤 드롭으로 .claude 설정을 시각적으로 조합
- 기술 스택 선택 시 연쇄 추천 (PHP → Laravel → Eloquent → N+1 방지)
- 공식 문서 + AI + 실전 패턴 3계층 기반 지능적 추천
- 완성된 설정을 ZIP 또는 웹에서 복사하여 프로젝트에 적용

## 2. 대상 사용자

### Primary
- Claude Code를 처음 접하는 개발자
- .claude 설정을 만들어본 적 없는 사용자

### Secondary
- 기존 .claude 설정을 개선하려는 사용자
- 새 프로젝트마다 .claude를 빠르게 세팅하려는 사용자

## 3. 제품 형태

| 항목 | 내용 |
|------|------|
| 배포 방식 | 오픈소스 (GitHub) |
| 실행 방식 | Docker (`docker compose up`) |
| 접속 방식 | localhost 웹 UI |
| 플랫폼 | PC 전용 (데스크톱 브라우저) |
| AI 엔진 | 로컬 Claude Code CLI |

## 4. 핵심 기능

### F1: 드래그 앤 드롭 빌더
- 캔버스에 Agent, Skill, Rule 노드를 배치
- 노드 간 연결선으로 관계 정의 (위임, 의존, 적용 범위)
- 실시간 프리뷰: 현재 조합의 .claude 폴더 구조 표시
- 노드 선택 시 속성 편집 패널 (frontmatter + body)

### F2: 지능적 추천 엔진
- **연쇄 추천**: 기술 스택 선택 → 연관 규칙/스킬 자동 제안
  - 예: "백엔드 엔지니어" → PHP? → Laravel? → Eloquent ORM 규칙, Migration 규칙, N+1 방지 규칙
- **3계층 추천 소스**:
  1. 공식 문서 기반: 프레임워크/라이브러리 best practice
  2. AI 실시간 생성: Claude Code CLI로 상황 맞춤 규칙 생성
  3. 실전 패턴: N+1, SQL Injection, XSS, CSRF 등 안티패턴 방지 규칙
- **추천 UI**: 사이드 패널에 추천 목록 표시, 클릭 또는 드래그로 캔버스에 추가

### F3: .claude 구조 가이드
- .claude 디렉토리 구조 시각적 안내
- 각 파일의 역할과 포맷 설명
- 생성된 설정의 폴더 트리 실시간 프리뷰

### F4: 내보내기
- ZIP 다운로드: 완성된 .claude 폴더 전체
- 웹 프리뷰: 파일별 내용 확인 + 개별 복사
- 폴더 구조 가이드 포함

### F5: 기존 설정 분석/최적화
- GitHub URL 또는 ZIP 업로드로 기존 .claude 불러오기
- 캔버스에 시각화
- 누락된 규칙 추천 (예: "Laravel 프로젝트인데 Eloquent 규칙이 없습니다")
- 개선 제안

## 5. 추천 흐름 예시

```
사용자: "백엔드 엔지니어 에이전트를 만들고 싶어"

시스템: Agent 노드 생성
  → "어떤 언어/프레임워크?"

사용자: "PHP"

시스템 추천:
  ├── Rule: PHP 코딩 표준 (PSR-12)
  ├── Rule: PHP 보안 규칙
  └── "프레임워크를 사용하나요?"
      ├── Laravel
      ├── Symfony
      └── CodeIgniter

사용자: "Laravel"

시스템 추가 추천:
  ├── Rule: Eloquent ORM 규칙
  │     └── 하위 추천: N+1 문제 방지, Mass Assignment 보호
  ├── Rule: Migration 규칙
  ├── Rule: Blade 템플릿 규칙
  ├── Rule: Laravel 라우팅 규칙
  ├── Skill: /laravel-feature
  ├── Skill: /laravel-test (PHPUnit + Pest)
  └── "Queue/Redis를 사용하나요?"

사용자: "네"

시스템 추가 추천:
  ├── Rule: Queue Job 규칙
  ├── Rule: Redis 캐시 규칙
  └── Agent: infra-engineer 추천 (Docker + Redis 관리)
```

## 6. 기술 스택

| 항목 | 기술 |
|------|------|
| 프론트엔드 | React + TypeScript + Tailwind CSS |
| 드래그 앤 드롭 | React Flow |
| 백엔드 | Node.js |
| DB | SQLite (템플릿/패턴 저장) |
| AI 엔진 | 로컬 Claude Code CLI (Paperclip adapter 방식) |
| 인프라 | Docker + Docker Compose |
| 라이선스 | MIT (오픈소스) |

## 7. .claude 디렉토리 구조 (참고)

```
.claude/
├── CLAUDE.md                    # 프로젝트 개요
├── settings.json               # 권한, 플러그인 설정
├── agents/                     # 에이전트 정의
│   └── {name}.md              # YAML frontmatter + 마크다운
├── skills/                    # 스킬 정의
│   └── {name}/
│       ├── SKILL.md           # YAML frontmatter + 마크다운
│       └── reference/         # 참조 문서
└── rules/                     # 규칙 정의
    └── {category}/
        └── {name}.md          # YAML frontmatter (paths) + 마크다운
```

## 8. 릴리스 전략

| 버전 | 범위 | 목표 |
|------|------|------|
| v0.1 (MVP) | 캔버스 빌더 + 수동 노드 생성/편집 + ZIP 내보내기 | "드래그로 .claude를 만들 수 있다" |
| v0.2 | Claude Code CLI 연동 + 기본 추천 | "AI가 연관 설정을 추천한다" |
| v0.3 | 연쇄 추천 + 공식 문서 기반 규칙 | "기술 스택 선택하면 자동으로 규칙이 붙는다" |
| v0.4 | 기존 설정 분석/최적화 | "현재 설정의 부족한 점을 알려준다" |
| v1.0 | 안정화 + 커뮤니티 템플릿 | "커뮤니티가 만든 설정을 공유한다" |

## 9. 비기능 요구사항

| 항목 | 요구사항 |
|------|----------|
| 플랫폼 | PC 전용 (데스크톱 브라우저) |
| 브라우저 | Chrome, Firefox, Safari 최신 버전 |
| 실행 | docker compose up으로 즉시 시작 |
| 의존성 | Docker만 있으면 실행 가능 (Claude Code CLI는 추천 기능에만 필요) |
| 언어 | UI 영문 기본 (오픈소스 글로벌 대상) |
| 성능 | 캔버스에 50+ 노드에서도 60fps 유지 |
