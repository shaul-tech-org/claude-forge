import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Section {
  id: string;
  title: string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    id: 'what-is',
    title: 'Harness Engineering이란?',
    content: `Harness Engineering은 AI 코딩 에이전트가 최적의 성능을 발휘할 수 있도록 환경을 설계하는 방법론입니다.

단순히 프롬프트를 잘 쓰는 것을 넘어, 에이전트의 컨텍스트, 검증 루프, 상태 관리, 도구 구성, 사람의 개입, 라이프사이클 자동화까지 6개 축을 종합적으로 설계합니다.

Claude Code에서 하네스는 .claude/ 디렉토리에 정의됩니다:
- CLAUDE.md: 프로젝트 컨텍스트
- agents/: 에이전트 정의
- skills/: 스킬 정의
- rules/: 규칙 파일
- settings.json: 권한 및 설정

좋은 하네스는 에이전트가 올바른 컨텍스트를 가지고, 자동으로 품질을 검증하며, 위험한 작업에서 사람의 확인을 받을 수 있게 합니다.`,
  },
  {
    id: 'six-axes',
    title: '6축 프레임워크',
    content: `**1. Context Engineering (컨텍스트 엔지니어링)**
모델에 전달되는 정보의 질과 양을 관리합니다. CLAUDE.md에 프로젝트 정의, 기술 스택, 아키텍처를 기술하고, Rules로 코딩 표준을 전달합니다. 너무 많은 정보는 토큰을 낭비하고, 너무 적으면 에이전트가 맥락을 잃습니다.

**2. Verification Loops (검증 루프)**
에이전트 출력물의 품질을 자동으로 검증합니다. 리뷰 에이전트, 테스트 스킬, 린트 규칙 등을 조합하여 다층 검증 체계를 구축합니다.

**3. State Management (상태 관리)**
세션 간 학습과 기억을 관리합니다. Auto Memory를 활성화하고, CLAUDE.md에 프로젝트 상태를 기록하여 에이전트가 이전 맥락을 유지할 수 있게 합니다.

**4. Tool Orchestration (도구 구성)**
에이전트, 스킬, MCP 서버 등 도구의 최적 조합을 설계합니다. 에이전트 간 위임 관계, 스킬의 사용자 호출 가능 여부, 도구 중복 제거 등을 고려합니다.

**5. Human-in-the-Loop (사람의 개입)**
위험한 결정에서 사람이 개입할 수 있는 장치를 설계합니다. Permission mode, 위험 명령 차단 훅, 승인 게이트 등을 설정합니다.

**6. Lifecycle Management (라이프사이클 관리)**
이벤트 기반 자동화를 설정합니다. PreToolUse/PostToolUse 훅으로 명령 실행 전후 검증, Notification 훅으로 알림, 자동 포맷터 실행 등을 구성합니다.`,
  },
  {
    id: 'getting-started',
    title: '시작하기 튜토리얼',
    content: `**Step 1: 프로젝트 분석**
먼저 프로젝트의 기술 스택, 팀 규모, 주요 작업 유형을 파악합니다. 이 정보가 하네스 설계의 기초가 됩니다.

**Step 2: 패턴 선택**
claude-forge의 패턴 라이브러리에서 프로젝트에 맞는 아키텍처 패턴을 선택합니다.
- 1인 프로젝트: Solo 패턴
- 풀스택 팀: Expert Pool 패턴
- 품질 중시: Producer-Reviewer 패턴

**Step 3: Harness Wizard 실행**
/create에서 5단계 위자드를 따라가며 하네스를 설계합니다. 위자드가 기술 스택에 맞는 규칙과 스킬을 자동 추천합니다.

**Step 4: Canvas에서 미세 조정**
Canvas Builder에서 노드를 추가/제거하고 연결을 조정합니다. PropertyPanel의 6축 안내를 참고하세요.

**Step 5: 평가 & 개선**
6축 평가를 실행하여 현재 하네스의 강점과 약점을 파악합니다. 제안에 따라 반복 개선하세요.

**Step 6: 내보내기**
완성된 하네스를 .claude/ ZIP으로 내보내서 프로젝트에 적용합니다.`,
  },
  {
    id: 'faq',
    title: 'FAQ',
    content: `**Q: 하네스가 없어도 Claude Code를 사용할 수 있나요?**
A: 네. Claude Code는 하네스 없이도 동작합니다. 하지만 하네스를 설정하면 일관된 품질, 자동 검증, 팀 표준 적용 등의 이점을 얻을 수 있습니다.

**Q: 에이전트를 몇 개까지 만들 수 있나요?**
A: 기술적 제한은 없지만, 에이전트가 많을수록 Context Budget을 많이 사용합니다. 일반적으로 3~5개의 전문 에이전트가 적절합니다.

**Q: Context Budget이 부족하면 어떻게 하나요?**
A: CLAUDE.md를 간결하게 유지하고, 상세 규칙은 Rules 파일로 분리하세요. glob paths를 설정하면 필요한 파일에서만 규칙이 로드됩니다.

**Q: 기존 .claude/ 설정을 가져올 수 있나요?**
A: /analyze 페이지에서 ZIP 업로드 또는 GitHub URL로 기존 설정을 가져와 분석할 수 있습니다.

**Q: 팀원과 하네스를 공유하려면?**
A: .claude/ 디렉토리를 git으로 관리하세요. 팀원이 동일한 하네스를 사용하게 됩니다. 개인 설정은 settings.local.json으로 분리할 수 있습니다.`,
  },
];

export function LearnPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  const current = SECTIONS.find((s) => s.id === activeSection) ?? SECTIONS[0];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 shrink-0 border-r bg-white p-6">
        <button onClick={() => navigate('/')} className="mb-6 text-sm text-blue-600 hover:underline">&larr; Home</button>
        <h2 className="mb-4 text-lg font-bold text-gray-900">Learning Guide</h2>
        <nav className="space-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                activeSection === section.id
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-12 py-10">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">{current.title}</h1>
        <div className="prose prose-sm max-w-3xl text-gray-700">
          {current.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('**') && paragraph.includes('**\n')) {
              const [title, ...rest] = paragraph.split('\n');
              return (
                <div key={i} className="mb-4">
                  <h3 className="mb-1 text-sm font-bold text-gray-900">{title.replace(/\*\*/g, '')}</h3>
                  <p className="text-sm leading-relaxed">{rest.join('\n')}</p>
                </div>
              );
            }
            if (paragraph.startsWith('**Q:')) {
              const lines = paragraph.split('\n');
              return (
                <div key={i} className="mb-4 rounded-lg border bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900">{lines[0].replace(/\*\*/g, '')}</p>
                  <p className="mt-1 text-sm text-gray-600">{lines.slice(1).join('\n').replace(/\*\*/g, '')}</p>
                </div>
              );
            }
            return <p key={i} className="mb-3 text-sm leading-relaxed">{paragraph}</p>;
          })}
        </div>
      </main>
    </div>
  );
}
