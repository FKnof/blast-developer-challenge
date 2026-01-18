import { useState, useEffect } from 'react';
import type { MatchData, ScoreboardData } from '../types';

interface UseMatchDataReturn {
  match: MatchData | null;
  scoreboard: ScoreboardData | null;
  loading: boolean;
  error: string | null;
}

export function useMatchData(): UseMatchDataReturn {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [matchRes, scoreboardRes] = await Promise.all([
          fetch('/api/match'),
          fetch('/api/scoreboard'),
        ]);

        if (!matchRes.ok) {
          throw new Error(`Failed to fetch match data: ${matchRes.statusText}`);
        }
        if (!scoreboardRes.ok) {
          throw new Error(`Failed to fetch scoreboard: ${scoreboardRes.statusText}`);
        }

        const matchData = await matchRes.json();
        const scoreboardData = await scoreboardRes.json();

        setMatch(matchData);
        setScoreboard(scoreboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { match, scoreboard, loading, error };
}
