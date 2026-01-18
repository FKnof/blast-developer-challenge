import { getParsedEvents } from '../parser/index.js';
import { getMatchData } from './match.js';

export interface RoundInfo {
  round: number;
  duration: number; // in seconds
  winner: string;   // team name
  winnerSide: 'CT' | 'T';
}

export interface RoundsData {
  rounds: RoundInfo[];
  averageDuration: number;
  team1: { name: string };
  team2: { name: string };
}

/**
 * Calculate round durations from parsed events
 */
export function getRoundsData(): RoundsData {
  const { events } = getParsedEvents();
  const matchData = getMatchData();
  
  // Collect round start/end timestamps
  const roundStarts: Map<number, number> = new Map();
  const roundEnds: Map<number, number> = new Map();
  const roundWinners: Map<number, { team: string; side: 'CT' | 'T' }> = new Map();
  
  // Track team-to-side mapping (changes at halftime)
  // At start: team1 = CT, team2 = T
  // After round 15: team1 = T, team2 = CT
  const team1Name = matchData.teams.ct.name;
  const team2Name = matchData.teams.t.name;
  
  for (const event of events) {
    const roundNum = event.round;
    if (!roundNum || roundNum < 1) continue;
    
    if (event.type === 'round_start') {
      roundStarts.set(roundNum, event.ts);
    }
    
    if (event.type === 'round_end') {
      roundEnds.set(roundNum, event.ts);
    }
    
    // Get winner from team_triggered events
    if (event.type === 'team_triggered') {
      const payload = event.payload as { 
        trigger?: string; 
        team?: string;
        ctScore?: number;
        tScore?: number;
      };
      
      // Check for win triggers
      const trigger = payload.trigger || '';
      if (trigger.includes('Win') || trigger.includes('Bombed') || trigger.includes('Defused')) {
        const winningSide = payload.team as 'CT' | 'TERRORIST';
        const isSecondHalf = roundNum > 15;
        
        // Determine winning team name based on side and half
        let winnerName: string;
        let winnerSideShort: 'CT' | 'T';
        
        if (winningSide === 'CT') {
          winnerSideShort = 'CT';
          winnerName = isSecondHalf ? team2Name : team1Name;
        } else {
          winnerSideShort = 'T';
          winnerName = isSecondHalf ? team1Name : team2Name;
        }
        
        roundWinners.set(roundNum, { team: winnerName, side: winnerSideShort });
      }
    }
  }
  
  // Build round info array
  const rounds: RoundInfo[] = [];
  const totalRounds = matchData.totalRounds;
  
  for (let r = 1; r <= totalRounds; r++) {
    const startTs = roundStarts.get(r);
    const endTs = roundEnds.get(r);
    const winner = roundWinners.get(r);
    
    if (startTs && endTs && winner) {
      const duration = endTs - startTs;
      
      rounds.push({
        round: r,
        duration,
        winner: winner.team,
        winnerSide: winner.side,
      });
    }
  }
  
  // Calculate average duration
  const totalDuration = rounds.reduce((sum, r) => sum + r.duration, 0);
  const averageDuration = rounds.length > 0 
    ? Math.round(totalDuration / rounds.length) 
    : 0;
  
  return {
    rounds,
    averageDuration,
    team1: { name: team1Name },
    team2: { name: team2Name },
  };
}
