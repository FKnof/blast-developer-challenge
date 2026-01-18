import { getParsedEvents } from '../parser/index.js';

/**
 * Daten für einen einzelnen Runden-Datenpunkt
 */
export interface RoundDataPoint {
  round: number;
  team1Score: number;
  team2Score: number;
  winner: 'team1' | 'team2' | null;
  winnerSide: 'CT' | 'T' | null;
}

/**
 * Gesamte Progression-Daten für den Chart
 */
export interface ProgressionData {
  team1: { name: string };
  team2: { name: string };
  halftimeRound: number;
  rounds: RoundDataPoint[];
}

/**
 * Extrahiert die Score-Progression über alle Runden
 * 
 * Verwendet team_triggered Events, die nach jeder Runde den Score enthalten:
 * - Team "CT" triggered "SFUI_Notice_CTs_Win" (CT "5") (T "3")
 */
export function getProgression(): ProgressionData {
  const { events } = getParsedEvents();
  
  // === Team-Namen ermitteln (wie in match.ts) ===
  let team1Name = '';  // Initial CT
  let team2Name = '';  // Initial T
  
  // Aktuelles Seiten-Mapping tracken
  const currentSideToTeam: { CT: string; TERRORIST: string } = {
    CT: '',
    TERRORIST: '',
  };
  
  // Runden-Daten sammeln
  const rounds: RoundDataPoint[] = [];
  
  // Scores pro Team-Name tracken
  const teamScores: Map<string, number> = new Map();
  
  for (const event of events) {
    // Team-Mapping aktualisieren
    if (event.type === 'match_status_team' || event.type === 'team_playing') {
      const payload = event.payload as { side: string; teamName: string };
      
      if (payload.side === 'CT') {
        currentSideToTeam.CT = payload.teamName;
        if (!team1Name) team1Name = payload.teamName;
      } else if (payload.side === 'TERRORIST') {
        currentSideToTeam.TERRORIST = payload.teamName;
        if (!team2Name) team2Name = payload.teamName;
      }
    }
    
    // Bei team_triggered Events: Score nach der Runde erfassen
    if (event.type === 'team_triggered') {
      const payload = event.payload as {
        team: string;
        trigger: string;
        ctScore?: number;
        tScore?: number;
      };
      
      // Nur Events mit Score-Info verarbeiten
      if (payload.ctScore === undefined || payload.tScore === undefined) {
        continue;
      }
      
      // Scores den Teams zuweisen (basierend auf aktuellem Mapping)
      if (currentSideToTeam.CT) {
        teamScores.set(currentSideToTeam.CT, payload.ctScore);
      }
      if (currentSideToTeam.TERRORIST) {
        teamScores.set(currentSideToTeam.TERRORIST, payload.tScore);
      }
      
      // Runden-Nummer = Summe der Scores
      const roundNumber = payload.ctScore + payload.tScore;
      
      // Gewinner ermitteln
      const winnerSide = payload.team as 'CT' | 'T' | 'TERRORIST';
      const normalizedWinnerSide: 'CT' | 'T' = winnerSide === 'TERRORIST' ? 'T' : 'CT';
      
      // Welches Team hat gewonnen?
      let winner: 'team1' | 'team2' | null = null;
      if (winnerSide === 'CT' && currentSideToTeam.CT === team1Name) {
        winner = 'team1';
      } else if (winnerSide === 'CT' && currentSideToTeam.CT === team2Name) {
        winner = 'team2';
      } else if ((winnerSide === 'TERRORIST' || winnerSide === 'T') && currentSideToTeam.TERRORIST === team1Name) {
        winner = 'team1';
      } else if ((winnerSide === 'TERRORIST' || winnerSide === 'T') && currentSideToTeam.TERRORIST === team2Name) {
        winner = 'team2';
      }
      
      // Duplikate vermeiden (gleiche Runde nicht doppelt erfassen)
      const existingRound = rounds.find(r => r.round === roundNumber);
      if (existingRound) {
        continue;
      }
      
      rounds.push({
        round: roundNumber,
        team1Score: teamScores.get(team1Name) ?? 0,
        team2Score: teamScores.get(team2Name) ?? 0,
        winner,
        winnerSide: normalizedWinnerSide,
      });
    }
  }
  
  // Sortiere nach Runden-Nummer
  rounds.sort((a, b) => a.round - b.round);
  
  // Füge Runde 0 als Startpunkt hinzu (0:0)
  if (rounds.length > 0 && rounds[0].round !== 0) {
    rounds.unshift({
      round: 0,
      team1Score: 0,
      team2Score: 0,
      winner: null,
      winnerSide: null,
    });
  }
  
  return {
    team1: { name: team1Name || 'Team 1' },
    team2: { name: team2Name || 'Team 2' },
    halftimeRound: 15,  // CS:GO/CS2 Standard: Seitenwechsel nach Runde 15
    rounds,
  };
}
