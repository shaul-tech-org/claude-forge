# claude-forge

> Drag-and-drop builder for Claude Code `.claude` configurations with intelligent recommendations.

Claude Code의 `.claude` 설정(에이전트, 스킬, 규칙)을 시각적으로 조합하고, AI 기반 연쇄 추천으로 최적의 설정을 생성하는 도구.

## Features

- **Drag & Drop Builder** — 캔버스에서 Agent, Skill, Rule 노드를 배치하고 연결
- **Intelligent Recommendations** — 기술 스택 선택 시 연관 설정 자동 추천
- **3-Layer Knowledge** — 공식 문서 + AI(Claude Code CLI) + 실전 패턴
- **Export** — ZIP 다운로드 또는 웹에서 복사

## Quick Start

```bash
docker compose up
```

Open http://localhost:3000

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + React Flow + Tailwind CSS |
| Backend | PHP 8.4 + Laravel 13 |
| Database | PostgreSQL 18 |
| AI Engine | Local Claude Code CLI |
| Infra | Docker Compose |

## License

MIT
