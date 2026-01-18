import { useState, useEffect } from 'react';
import type { MatchData, ScoreboardData, ProgressionData, RoundsData } from '../types';

interface UseMatchDataReturn {
  match: MatchData | null;
  scoreboard: ScoreboardData | null;
  progression: ProgressionData | null;
  rounds: RoundsData | null;
  loading: boolean;
  error: string | null;
}

export function useMatchData(): UseMatchDataReturn {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardData | null>(null);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [rounds, setRounds] = useState<RoundsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [matchRes, scoreboardRes, progressionRes, roundsRes] = await Promise.all([
          fetch('/api/match'),
          fetch('/api/scoreboard'),
          fetch('/api/progression'),
          fetch('/api/rounds'),
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
        if (!roundsRes.ok) {
          throw new Error(`Failed to fetch rounds: ${roundsRes.statusText}`);
        }

        const matchData = await matchRes.json();
        const scoreboardData = await scoreboardRes.json();
        const progressionData = await progressionRes.json();
        const roundsData = await roundsRes.json();

        setMatch(matchData);
        setScoreboard(scoreboardData);
        setProgression(progressionData);
        setRounds(roundsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { match, scoreboard, progression, rounds, loading, error };
}
