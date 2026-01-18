import { getParsedEvents } from '../parser/index.js';

export interface RoundDataPoint {
  round: number;
  team1Score: number;
  team2Score: number;
}

export interface ProgressionData {
  team1: { name: string };
  team2: { name: string };
  halftimeRound: number;
  rounds: RoundDataPoint[];
}

/**
 * Extrahiert die Score-Progression über alle Runden.
 * 
 * Einfache Logik:
 * 1. Finde das initiale Team-Mapping (wer ist CT, wer ist T)
 * 2. Gehe durch alle team_triggered Events (Runden-Siege)
 * 3. Zähle Scores hoch - bei Runde 16+ sind die Seiten getauscht
 */
export function getProgression(): ProgressionData {
  const { events } = getParsedEvents();
  
  // Schritt 1: Initiales Mapping finden (erstes team_playing Event)
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
  
  // team1 = initial CT, team2 = initial T
  const team1Name = ctTeam || 'Team 1';
  const team2Name = tTeam || 'Team 2';
  
  // Schritt 2: Durch alle Runden-Siege gehen
  const rounds: RoundDataPoint[] = [{ round: 0, team1Score: 0, team2Score: 0 }];
  const seenRounds = new Set<number>();
  let team1Score = 0;
  let team2Score = 0;
  
  for (const event of events) {
    if (event.type !== 'team_triggered') continue;
    
    const payload = event.payload as { team: string };
    
    // Rundennummer aus dem Event (wird vom Parser gesetzt)
    const roundNumber = event.round;
    if (!roundNumber || seenRounds.has(roundNumber)) continue;
    seenRounds.add(roundNumber);
    
    // Welche Seite hat gewonnen?
    const ctWon = payload.team === 'CT';
    
    // Bei Runde 16+ sind die Seiten getauscht!
    const isSecondHalf = roundNumber > 15;
    
    // Erste Hälfte: CT = team1, T = team2
    // Zweite Hälfte: CT = team2, T = team1
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
    halftimeRound: 15,
    rounds,
  };
}
