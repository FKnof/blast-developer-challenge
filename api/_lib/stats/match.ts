import type { MatchData, GameEvent } from '../../../src/types/index.js';
import { getParsedEvents } from '../parser/index.js';

interface TeamInfo {
  name: string;
  score: number;
}

/**
 * Extract match metadata from parsed events
 * 
 * WICHTIG: Die Teams wechseln bei Halftime die Seiten (CT <-> T).
 * Deshalb tracken wir:
 * 1. Das aktuelle Seiten-Mapping (welches Team ist gerade CT/T)
 * 2. Scores pro TEAM-NAME (nicht pro Seite)
 */
export function getMatchData(): MatchData {
  const { events } = getParsedEvents();
  
  let map = 'unknown';
  let date = '';
  let totalRounds = 0;
  
  // === SCHRITT 1: Aktuelles Seiten-Mapping tracken ===
  // Wird bei JEDEM match_status_team Event aktualisiert
  const currentSideToTeam: { CT: string; TERRORIST: string } = {
    CT: '',
    TERRORIST: '',
  };
  
  // === SCHRITT 2: Scores pro TEAM-NAME speichern ===
  // Nicht pro Seite (CT/T), sondern pro echtem Team-Namen
  const teamScores: Map<string, number> = new Map();
  
  // Speichere die initialen Team-Namen (für die Reihenfolge in der UI)
  let team1Name = '';  // Das Team, das zuerst CT war
  let team2Name = '';  // Das Team, das zuerst T war
  
  for (const event of events) {
    // === Match-Start Info (Map, Datum) ===
    if (event.type === 'match_start') {
      const payload = event.payload as { map?: string };
      if (payload.map) {
        map = payload.map;
      }
      if (event.ts && !date) {
        date = new Date(event.ts).toISOString();
      }
    }
    
    // === SCHRITT 3: Seiten-Mapping IMMER aktualisieren ===
    // Bei jedem match_status_team Event wird das Mapping neu gesetzt
    if (event.type === 'match_status_team') {
      const payload = event.payload as { side: string; teamName: string };
      
      if (payload.side === 'CT') {
        currentSideToTeam.CT = payload.teamName;
        // Erstes CT-Team merken für UI-Reihenfolge
        if (!team1Name) {
          team1Name = payload.teamName;
        }
      } else if (payload.side === 'TERRORIST') {
        currentSideToTeam.TERRORIST = payload.teamName;
        // Erstes T-Team merken für UI-Reihenfolge
        if (!team2Name) {
          team2Name = payload.teamName;
        }
      }
    }
    
    // Fallback: team_playing Events (ohne MatchStatus: Prefix)
    if (event.type === 'team_playing') {
      const payload = event.payload as { side: string; teamName: string };
      if (payload.side === 'CT') {
        currentSideToTeam.CT = payload.teamName;
        if (!team1Name) team1Name = payload.teamName;
      } else if (payload.side === 'TERRORIST') {
        currentSideToTeam.TERRORIST = payload.teamName;
        if (!team2Name) team2Name = payload.teamName;
      }
    }
    
    // === SCHRITT 4: Bei Score-Event das AKTUELLE Mapping verwenden ===
    if (event.type === 'match_status_score') {
      const payload = event.payload as { 
        ctScore: number; 
        tScore: number; 
        roundsPlayed: number;
      };
      
      // Score dem AKTUELLEN CT-Team zuweisen
      if (currentSideToTeam.CT) {
        teamScores.set(currentSideToTeam.CT, payload.ctScore);
      }
      // Score dem AKTUELLEN T-Team zuweisen
      if (currentSideToTeam.TERRORIST) {
        teamScores.set(currentSideToTeam.TERRORIST, payload.tScore);
      }
      
      // RoundsPlayed aus dem letzten Score-Event
      if (payload.roundsPlayed >= 0) {
        totalRounds = payload.roundsPlayed;
      }
    }
  }
  
  // === SCHRITT 5: Ergebnis zusammenbauen ===
  // team1 war initial CT, team2 war initial T
  const team1Score = teamScores.get(team1Name) ?? 0;
  const team2Score = teamScores.get(team2Name) ?? 0;
  
  return {
    map,
    date,
    teams: {
      // "ct" und "t" sind hier nur Labels für die UI-Position
      // team1 = links (war initial CT), team2 = rechts (war initial T)
      ct: { name: team1Name || 'Team 1', score: team1Score },
      t: { name: team2Name || 'Team 2', score: team2Score },
    },
    totalRounds,
  };
}

/**
 * Get all events of a specific type
 */
export function getEventsByType(type: string): GameEvent[] {
  const { events } = getParsedEvents();
  return events.filter(e => e.type === type);
}
