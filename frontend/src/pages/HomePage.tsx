import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onClick: () => void;
}

function DashboardCard({ title, description, icon, color, onClick }: DashboardCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-3 rounded-2xl border-2 border-transparent bg-white p-6 text-left shadow-sm transition hover:border-blue-200 hover:shadow-lg ${color}`}
    >
      <span className="text-3xl">{icon}</span>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
    </button>
  );
}

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white">
      <header className="px-8 pt-16 pb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">claude-forge</h1>
        <p className="mx-auto mt-3 max-w-lg text-lg text-gray-500">
          Harness Engineering Platform &mdash; AI harness design, build, evaluate
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl px-8 pb-16">
        <div className="grid gap-5 sm:grid-cols-2">
          <DashboardCard
            title="New Harness"
            description="Harness Wizard로 프로젝트에 맞는 AI 하네스를 설계하세요. 5단계 가이드를 따라 최적의 아키텍처를 구축합니다."
            icon="&#10024;"
            color=""
            onClick={() => navigate('/create')}
          />
          <DashboardCard
            title="Analyze Harness"
            description="기존 .claude/ 설정을 업로드하거나 GitHub URL로 가져와 6축 프레임워크로 평가하세요."
            icon="&#128269;"
            color=""
            onClick={() => navigate('/analyze')}
          />
          <DashboardCard
            title="Pattern Library"
            description="Solo, Pipeline, Expert Pool 등 검증된 아키텍처 패턴을 탐색하고 프로젝트에 적용하세요."
            icon="&#128218;"
            color=""
            onClick={() => navigate('/patterns')}
          />
          <DashboardCard
            title="Learning Guide"
            description="Harness Engineering의 기초부터 6축 프레임워크까지. 체계적인 학습 가이드로 시작하세요."
            icon="&#127891;"
            color=""
            onClick={() => navigate('/learn')}
          />
        </div>
        <div className="mt-8">
          <button
            onClick={() => navigate('/create/builder')}
            className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-white py-6 text-center text-sm text-gray-400 transition hover:border-blue-300 hover:text-blue-500"
          >
            Canvas Builder &rarr; 직접 캔버스에서 시작하기
          </button>
        </div>
      </main>
    </div>
  );
}
