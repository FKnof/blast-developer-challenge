import { useState, useEffect } from 'react';
import type { MatchData, ScoreboardData, ProgressionData } from '../types';

interface UseMatchDataReturn {
  match: MatchData | null;
  scoreboard: ScoreboardData | null;
  progression: ProgressionData | null;
  loading: boolean;
  error: string | null;
}

export function useMatchData(): UseMatchDataReturn {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardData | null>(null);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [matchRes, scoreboardRes, progressionRes] = await Promise.all([
          fetch('/api/match'),
          fetch('/api/scoreboard'),
          fetch('/api/progression'),
        ]);

        if (!matchRes.ok) {
          throw new Error(`Failed to fetch match data: ${matchRes.statusText}`);
        }
        if (!scoreboardRes.ok) {
          throw new Error(`Failed to fetch scoreboard: ${scoreboardRes.statusText}`);
        }
        if (!progressionRes.ok) {
          throw new Error(`Failed to fetch progression: ${progressionRes.statusText}`);
        }

        const matchData = await matchRes.json();
        const scoreboardData = await scoreboardRes.json();
        const progressionData = await progressionRes.json();

        setMatch(matchData);
        setScoreboard(scoreboardData);
        setProgression(progressionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { match, scoreboard, progression, loading, error };
}
