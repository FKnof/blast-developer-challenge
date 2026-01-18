import type { MatchData } from '../../../src/types/index.js';
import { getParsedEvents } from '../parser/index.js';

/**
 * Extract match metadata from parsed events.
 * Teams swap sides at halftime, so we track scores by team name (not by side).
 */
export function getMatchData(): MatchData {
  const { events } = getParsedEvents();
  
  let map = 'unknown';
  let date = '';
  let totalRounds = 0;
  let matchStartTs = 0;
  let gameOverTs = 0;
  
  // Track which team is currently on which side
  const currentSideToTeam: { CT: string; TERRORIST: string } = {
    CT: '',
    TERRORIST: '',
  };
  
  // Store scores by team name
  const teamScores: Map<string, number> = new Map();
  
  // Store initial team names for UI order
  let team1Name = '';
  let team2Name = '';
  
  for (const event of events) {
    if (event.type === 'match_start') {
      const payload = event.payload as { map?: string };
      if (payload.map) {
        map = payload.map;
      }
      matchStartTs = event.ts;
      if (event.ts && !date) {
        date = new Date(event.ts).toISOString();
      }
    }
    
    if (event.type === 'game_over') {
      gameOverTs = event.ts;
      const payload = event.payload as { map?: string };
      if (payload.map && map === 'unknown') {
        map = payload.map;
      }
    }
    
    // Update side mapping on team status events
    if (event.type === 'match_status_team') {
      const payload = event.payload as { side: string; teamName: string };
      
      if (payload.side === 'CT') {
        currentSideToTeam.CT = payload.teamName;
        if (!team1Name) team1Name = payload.teamName;
      } else if (payload.side === 'TERRORIST') {
        currentSideToTeam.TERRORIST = payload.teamName;
        if (!team2Name) team2Name = payload.teamName;
      }
    }
    
    // Fallback: team_playing events
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
    
    // Assign scores using current side mapping
    if (event.type === 'match_status_score') {
      const payload = event.payload as { 
        ctScore: number; 
        tScore: number; 
        roundsPlayed: number;
      };
      
      if (currentSideToTeam.CT) {
        teamScores.set(currentSideToTeam.CT, payload.ctScore);
      }
      if (currentSideToTeam.TERRORIST) {
        teamScores.set(currentSideToTeam.TERRORIST, payload.tScore);
      }
      
      if (payload.roundsPlayed >= 0) {
        totalRounds = payload.roundsPlayed;
      }
    }
  }
  
  const team1Score = teamScores.get(team1Name) ?? 0;
  const team2Score = teamScores.get(team2Name) ?? 0;
  
  // Duration in seconds
  const totalDuration = matchStartTs && gameOverTs
    ? Math.round((gameOverTs - matchStartTs) / 1000)
    : 0;
  
  return {
    map,
    date,
    teams: {
      ct: { name: team1Name || 'Team 1', score: team1Score },
      t: { name: team2Name || 'Team 2', score: team2Score },
    },
    totalRounds,
    totalDuration,
  };
}
