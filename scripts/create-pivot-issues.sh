#!/bin/bash
# claude-forge 피벗 이슈 일괄 생성 스크립트
set -e

source .env

PROJECT_ID="0f65355d-c8c4-4d17-a1a4-6f7002b0ab06"
BASE="https://plane.shaul.kr/api/v1/workspaces/shaul-org/projects/$PROJECT_ID"
TODO="ecfd19f1-9e2f-4001-822f-5471ec98a425"
BACKLOG="19dd4e9a-cfd8-430e-8920-92eabee31979"

create_issue() {
  local name="$1"
  local desc="$2"
  local priority="$3"
  local state="$4"
  local parent="$5"

  local body
  if [ -n "$parent" ]; then
    body=$(python3 -c "
import json
print(json.dumps({
  'name': '''$name''',
  'description_html': '<p>$desc</p>',
  'priority': '$priority',
  'state': '$state',
  'parent': '$parent'
}))
")
  else
    body=$(python3 -c "
import json
print(json.dumps({
  'name': '''$name''',
  'description_html': '<p>$desc</p>',
  'priority': '$priority',
  'state': '$state'
}))
")
  fi

  local result
  result=$(curl -s -X POST "$BASE/issues/" \
    -H "x-api-key: $PLANE_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$body")

  local id seq
  id=$(echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id','ERROR'))" 2>/dev/null)
  seq=$(echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('sequence_id','?'))" 2>/dev/null)

  if [ "$id" = "ERROR" ] || [ -z "$id" ]; then
    echo "ERROR creating: $name"
    echo "$result" | head -c 500
    echo ""
    return 1
  fi

  echo "FORGE-$seq: $name → $id"
  echo "$id"
}

echo "========================================="
echo "Phase 0: 피벗 준비"
echo "========================================="

P0=$(create_issue \
  "[Phase 0] 피벗 준비 — Harness Engineering Platform 전환" \
  "claude-forge를 .claude 빌더에서 Harness Engineering 플랫폼으로 전환하기 위한 준비 작업. CLAUDE.md 재작성, 프로젝트 메타 변경, 기존 이슈 정리." \
  "urgent" \
  "$TODO" \
  "" | tail -1)

echo "  Parent ID: $P0"

create_issue "CLAUDE.md 재작성 — 하네스 플랫폼 정체성 반영" \
  "프로젝트 정의를 Harness Engineering Platform으로 변경. 6축 프레임워크 설명, 새 제품 비전, 업데이트된 기능 목록 반영." \
  "urgent" "$TODO" "$P0" > /dev/null

create_issue "PRD 업데이트 — 피벗 기획서 반영" \
  "docs/PRD.md를 PIVOT-PLAN.md 기반으로 재작성. AS-IS/TO-BE, 핵심 기능 6개, 로드맵 반영." \
  "high" "$TODO" "$P0" > /dev/null

create_issue "기존 Backlog 이슈 정리 — 피벗 대응 매핑" \
  "기존 FORGE-5,19,23,24,25,26,33,38,39,40,41 이슈를 피벗 이슈에 매핑하거나 Cancelled 처리." \
  "medium" "$TODO" "$P0" > /dev/null

create_issue "에이전트/스킬 description 업데이트" \
  "coordinator, be-developer, fe-developer, infra-engineer의 description을 하네스 플랫폼 맥락으로 수정." \
  "medium" "$TODO" "$P0" > /dev/null

echo ""
echo "========================================="
echo "Phase 1: Foundation (v0.5)"
echo "========================================="

P1=$(create_issue \
  "[Phase 1] Foundation v0.5 — 평가 + Budget + 패턴 목록" \
  "하네스 개념 도입, 6축 평가 기능 MVP, Context Budget 시각화, 패턴 카탈로그 기초." \
  "urgent" \
  "$TODO" \
  "" | tail -1)

echo "  Parent ID: $P1"

create_issue "PatternRegistry 구현 (7개 아키텍처 패턴)" \
  "Solo, Pipeline, Fan-out/Fan-in, Expert Pool, Producer-Reviewer, Supervisor, 3-Agent 패턴 데이터 정의. PHP Service class." \
  "high" "$TODO" "$P1" > /dev/null

create_issue "HarnessEvaluationService MVP — 6축 점수 산출" \
  "Context/Verification/State/Tools/Human/Lifecycle 각 0-100점 산출 로직. 체크리스트 기반 이진 판정 + 가중치 합산." \
  "urgent" "$TODO" "$P1" > /dev/null

create_issue "ContextBudgetCalculator — 토큰 예산 추정" \
  "에이전트/룰/CLAUDE.md 등 고정 context 토큰 추정. 파일별 근사치 계산 (바이트→토큰 변환). 256K 기준 가용량 계산." \
  "high" "$TODO" "$P1" > /dev/null

create_issue "신규 API 엔드포인트 5개 구현" \
  "GET /patterns, GET /patterns/:id, POST /harness/evaluate, POST /harness/context-budget, POST /harness/recommend. Controller + Route + Request validation." \
  "high" "$TODO" "$P1" > /dev/null

create_issue "패턴 목록 페이지 (/patterns)" \
  "5개 카테고리(스타터/팀/도메인/워크플로우/고급)별 패턴 카드 그리드. 각 카드: 이름, 설명, 다이어그램 썸네일, 팀 규모, 복잡도." \
  "high" "$TODO" "$P1" > /dev/null

create_issue "6축 평가 대시보드 — 레이더 차트" \
  "EvaluationDashboard 컴포넌트. 6축 레이더 차트 (Chart.js 또는 Recharts), 축별 점수/등급 표시, 개선 제안 목록." \
  "urgent" "$TODO" "$P1" > /dev/null

create_issue "Context Budget 바 차트 시각화" \
  "ContextBudgetVisualizer 컴포넌트. 256K 토큰 기준 스택 바 차트. System Prompt/Tools/CLAUDE.md/Rules/Agents/Memory 항목별 색상 구분. 실시간 업데이트." \
  "high" "$TODO" "$P1" > /dev/null

create_issue "홈 대시보드 재설계" \
  "새 IA 진입점: 새 하네스 만들기, 기존 하네스 분석, 패턴 라이브러리, 학습 가이드. 기존 Canvas 직접 진입도 유지." \
  "high" "$TODO" "$P1" > /dev/null

echo ""
echo "========================================="
echo "Phase 2: Wizard & Patterns (v0.6)"
echo "========================================="

P2=$(create_issue \
  "[Phase 2] Wizard & Patterns v0.6 — 하네스 마법사 + 캔버스 확장" \
  "Harness Wizard 5단계 완성, 패턴 프리셋 캔버스 적용, 추가 노드/엣지 타입." \
  "high" \
  "$BACKLOG" \
  "" | tail -1)

echo "  Parent ID: $P2"

create_issue "HarnessWizard 5단계 구현" \
  "Step 1: 프로젝트 프로필 / Step 2: 작업 유형 / Step 3: 패턴 추천 / Step 4: 6축 설계 / Step 5: Context Budget 확인. 각 단계 컴포넌트 + 상태 관리." \
  "urgent" "$BACKLOG" "$P2" > /dev/null

create_issue "패턴 프리셋 → Canvas 자동 배치" \
  "PatternTemplateLoader: 패턴 선택 시 React Flow 노드/엣지를 자동 배치. dagre 레이아웃 알고리즘 적용." \
  "high" "$BACKLOG" "$P2" > /dev/null

create_issue "HarnessRecommendationService — 체인 추천" \
  "기술스택→패턴→에이전트→스킬→룰→훅 순차 추천 로직. 기존 RecommendationEngine 확장." \
  "high" "$BACKLOG" "$P2" > /dev/null

create_issue "추가 Node 컴포넌트 5종" \
  "HookNode, McpServerNode, MemoryNode, PermissionNode, SettingsNode. 기존 AgentNode/SkillNode/RuleNode와 동일 패턴. 6축 색상 코딩." \
  "high" "$BACKLOG" "$P2" > /dev/null

create_issue "추가 Edge 타입 3종" \
  "TriggerEdge(점선), ReferenceEdge(대시선), LoadEdge(굵은). 기존 연결선과 시각적 구분." \
  "medium" "$BACKLOG" "$P2" > /dev/null

create_issue "패턴 상세 페이지 (/patterns/:id)" \
  "React Flow 다이어그램 + 설명 + 필요 파일 목록 + 6축 기대 점수 + 이 패턴으로 시작 버튼." \
  "high" "$BACKLOG" "$P2" > /dev/null

create_issue "PropertyPanel 가이드 폼 개편" \
  "YAML 직접 편집 → 가이드 폼으로 개편. 6축 관점 안내 문구 추가. 각 필드별 도움말 툴팁." \
  "medium" "$BACKLOG" "$P2" > /dev/null

echo ""
echo "========================================="
echo "Phase 3: Learning & Import (v0.7)"
echo "========================================="

P3=$(create_issue \
  "[Phase 3] Learning & Import v0.7 — 학습 가이드 + 외부 임포트" \
  "Harness Engineering 학습 가이드, .claude/ 업로드 분석, GitHub URL 임포트, 내보내기 리포트." \
  "medium" \
  "$BACKLOG" \
  "" | tail -1)

echo "  Parent ID: $P3"

create_issue "학습 가이드 페이지 (/learn)" \
  "Harness Engineering이란? / 6축 프레임워크 / 시작하기 튜토리얼 / FAQ. 마크다운 렌더링 기반 정적 콘텐츠." \
  "medium" "$BACKLOG" "$P3" > /dev/null

create_issue ".claude/ 업로드 → 분석 플로우" \
  "ZIP 업로드 → 구조 파싱 → 6축 평가 → 개선 제안. 기존 CliScanController 확장." \
  "high" "$BACKLOG" "$P3" > /dev/null

create_issue "GitHub URL 임포트" \
  "GitHubImportService: 저장소 URL → .claude/ 디렉토리 추출 → 분석. GitHub API 사용 (tree endpoint)." \
  "medium" "$BACKLOG" "$P3" > /dev/null

create_issue "내보내기 리포트 (설계문서 + 평가)" \
  "HarnessExportReport: .claude/ ZIP + 설계 문서(MD) + 6축 평가 리포트(MD). 통합 ZIP 다운로드." \
  "medium" "$BACKLOG" "$P3" > /dev/null

create_issue "도메인 특화 패턴 추가" \
  "Laravel Hexagonal, React+Next.js, Python ML, Go Microservice 등 기술 스택별 패턴. PatternRegistry 확장." \
  "low" "$BACKLOG" "$P3" > /dev/null

echo ""
echo "========================================="
echo "Phase 4: Polish & Launch (v1.0)"
echo "========================================="

P4=$(create_issue \
  "[Phase 4] Polish & Launch v1.0 — 안정화 + 커뮤니티" \
  "E2E 테스트, 성능 최적화, 반응형 UI, 문서화, 커뮤니티 패턴 제출 프로세스." \
  "medium" \
  "$BACKLOG" \
  "" | tail -1)

echo "  Parent ID: $P4"

create_issue "E2E 테스트 작성" \
  "Cypress(FE) + Pest(BE) E2E 테스트. Wizard 플로우, 평가 플로우, 패턴 적용 플로우, 내보내기 플로우." \
  "high" "$BACKLOG" "$P4" > /dev/null

create_issue "성능 최적화" \
  "캔버스 렌더링 최적화 (memo, virtualization), API 응답 캐싱, 번들 크기 최적화." \
  "medium" "$BACKLOG" "$P4" > /dev/null

create_issue "반응형 UI (태블릿 대응)" \
  "Wizard/패턴/학습 페이지 태블릿 레이아웃. Canvas는 데스크탑 전용 유지, 태블릿에서는 읽기 전용 뷰." \
  "low" "$BACKLOG" "$P4" > /dev/null

create_issue "프로젝트 문서화" \
  "README.md 전면 재작성, CONTRIBUTING.md 작성, 기여 가이드, 스크린샷/GIF 추가." \
  "medium" "$BACKLOG" "$P4" > /dev/null

create_issue "커뮤니티 패턴 제출 프로세스" \
  "패턴 제출 양식 + 자동 평가 점수 표시 + 일정 기준 이하 비공개. GitHub PR 기반 또는 웹 폼." \
  "low" "$BACKLOG" "$P4" > /dev/null

echo ""
echo "========================================="
echo "완료! 총 이슈 생성 수: 5 Parent + 26 Sub = 31개"
echo "========================================="
