import { useEffect, useRef, useCallback } from 'react';
import type { ForgeNode } from '../types/node';
import type { ForgeEdge } from '../types/edge';

const STORAGE_KEY = 'claude-forge-canvas';
const DEBOUNCE_MS = 500;

interface CanvasState {
  nodes: ForgeNode[];
  edges: ForgeEdge[];
}

export function loadCanvasState(): CanvasState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CanvasState;
  } catch {
    return null;
  }
}

export function useCanvasPersistence(nodes: ForgeNode[], edges: ForgeEdge[]): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(() => {
    const state: CanvasState = { nodes, edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [nodes, edges]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(save, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [save]);
}
