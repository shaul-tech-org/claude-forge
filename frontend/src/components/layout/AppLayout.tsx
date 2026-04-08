import { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { CanvasProvider } from '../../contexts/CanvasContext';
import { Toolbar } from '../toolbar/Toolbar';
import { Canvas } from '../canvas/Canvas';
import { PropertyPanel } from '../panel/PropertyPanel';
import { RecommendPanel } from '../recommend/RecommendPanel';
import { OnboardingWizard } from '../wizard/OnboardingWizard';
import { ClaudeMdEditor } from '../config/ClaudeMdEditor';
import { SettingsEditor } from '../config/SettingsEditor';
import { McpEditor } from '../config/McpEditor';
import { HooksEditor } from '../config/HooksEditor';

const ONBOARDING_KEY = 'claude-forge-onboarded';

export function AppLayout() {
  const [showRecommend, setShowRecommend] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showClaudeMd, setShowClaudeMd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMcp, setShowMcp] = useState(false);
  const [showHooks, setShowHooks] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem(ONBOARDING_KEY);
    if (!onboarded) {
      setShowWizard(true);
    }
  }, []);

  const handleCloseWizard = () => {
    setShowWizard(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  return (
    <ReactFlowProvider>
      <CanvasProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          <Toolbar
            onOpenRecommend={() => setShowRecommend(true)}
            onOpenWizard={() => setShowWizard(true)}
            onOpenClaudeMd={() => setShowClaudeMd(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenMcp={() => setShowMcp(true)}
            onOpenHooks={() => setShowHooks(true)}
          />
          <main className="flex-1">
            <Canvas />
          </main>
          {showRecommend ? (
            <RecommendPanel onClose={() => setShowRecommend(false)} />
          ) : (
            <PropertyPanel />
          )}
        </div>
        {showWizard && <OnboardingWizard onClose={handleCloseWizard} />}
        {showClaudeMd && <ClaudeMdEditor onClose={() => setShowClaudeMd(false)} />}
        {showSettings && <SettingsEditor onClose={() => setShowSettings(false)} />}
        {showMcp && <McpEditor onClose={() => setShowMcp(false)} />}
        {showHooks && <HooksEditor onClose={() => setShowHooks(false)} />}
      </CanvasProvider>
    </ReactFlowProvider>
  );
}
