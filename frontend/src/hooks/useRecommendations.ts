import { useState, useEffect, useCallback } from 'react';
import {
  fetchStacks,
  fetchRecommendations,
  type TechStack,
  type RecommendationResult,
} from '../api/recommendations';

interface UseRecommendationsReturn {
  stacks: TechStack[];
  selectedStackIds: string[];
  toggleStack: (id: string) => void;
  recommendations: RecommendationResult | null;
  loading: boolean;
  error: string | null;
}

export function useRecommendations(): UseRecommendationsReturn {
  const [stacks, setStacks] = useState<TechStack[]>([]);
  const [selectedStackIds, setSelectedStackIds] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStacks()
      .then(setStacks)
      .catch(() => setError('Failed to load stacks'));
  }, []);

  const toggleStack = useCallback((id: string) => {
    setSelectedStackIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }, []);

  useEffect(() => {
    if (selectedStackIds.length === 0) {
      setRecommendations(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      fetchRecommendations(selectedStackIds)
        .then(setRecommendations)
        .catch(() => setError('Failed to load recommendations'))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedStackIds]);

  return { stacks, selectedStackIds, toggleStack, recommendations, loading, error };
}
