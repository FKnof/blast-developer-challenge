import { getParsedEvents } from '../parser/index.js';
import { HALFTIME_ROUND } from '../../../src/types/index.js';
import type { ProgressionData, RoundDataPoint } from '../../../src/types/index.js';

/**
 * Extract score progression across all rounds.
 * Teams swap sides at halftime.
 */
export function getProgression(): ProgressionData {
  const { events } = getParsedEvents();
  
  // Find initial team mapping
  let ctTeam = '';
  let tTeam = '';
  
  for (const event of events) {
    if (event.type === 'match_status_team' || event.type === 'team_playing') {
      const payload = event.payload as { side: string; teamName: string };
      if (payload.side === 'CT' && !ctTeam) ctTeam = payload.teamName;
      if (payload.side === 'TERRORIST' && !tTeam) tTeam = payload.teamName;
      if (ctTeam && tTeam) break;
    }
  }
  
  const team1Name = ctTeam || 'Team 1';
  const team2Name = tTeam || 'Team 2';
  
  // Process round wins
  const rounds: RoundDataPoint[] = [{ round: 0, team1Score: 0, team2Score: 0 }];
  const seenRounds = new Set<number>();
  let team1Score = 0;
  let team2Score = 0;
  
  for (const event of events) {
    if (event.type !== 'team_triggered') continue;
    
    const payload = event.payload as { team: string };
    const roundNumber = event.round;
    if (!roundNumber || seenRounds.has(roundNumber)) continue;
    seenRounds.add(roundNumber);
    
    const ctWon = payload.team === 'CT';
    const isSecondHalf = roundNumber > HALFTIME_ROUND;
    if (ctWon) {
      if (isSecondHalf) team2Score++; else team1Score++;
    } else {
      if (isSecondHalf) team1Score++; else team2Score++;
    }
    
    rounds.push({ round: roundNumber, team1Score, team2Score });
  }
  
  return {
    team1: { name: team1Name },
    team2: { name: team2Name },
    halftimeRound: HALFTIME_ROUND,
    rounds,
  };
}
