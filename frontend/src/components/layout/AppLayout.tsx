import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { CanvasProvider } from '../../contexts/CanvasContext';
import { Toolbar } from '../toolbar/Toolbar';
import { Canvas } from '../canvas/Canvas';
import { PropertyPanel } from '../panel/PropertyPanel';
import { RecommendPanel } from '../recommend/RecommendPanel';

export function AppLayout() {
  const [showRecommend, setShowRecommend] = useState(false);

  return (
    <ReactFlowProvider>
      <CanvasProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          <Toolbar onOpenRecommend={() => setShowRecommend(true)} />
          <main className="flex-1">
            <Canvas />
          </main>
          {showRecommend ? (
            <RecommendPanel onClose={() => setShowRecommend(false)} />
          ) : (
            <PropertyPanel />
          )}
        </div>
      </CanvasProvider>
    </ReactFlowProvider>
  );
}
