import type { ScoreboardData, PlayerStats, Player } from '../../../src/types/index.js';
import { getParsedEvents } from '../parser/index.js';
import { getMatchData } from './match.js';

interface PlayerAccumulator {
  name: string;
  steamId: string;
  originalTeam: string; // The actual team name (TeamVitality, NAVI GGBET)
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  headshotKills: number;
}

/**
 * Calculate scoreboard data from parsed events
 */
export function getScoreboard(): ScoreboardData {
  const { events } = getParsedEvents();
  const matchData = getMatchData();
  const totalRounds = matchData.totalRounds || 1;
  
  // First pass: determine which players belong to which team at match start
  // This is based on the initial side assignment (CT = TeamVitality, T = NAVI GGBET at start)
  const playerToTeam: Map<string, string> = new Map();
  let initialCtTeam = matchData.teams.ct.name;
  let initialTTeam = matchData.teams.t.name;
  
  // Find player team assignments from early events (round 0 or 1)
  for (const event of events) {
    if (event.round !== null && event.round > 1) break; // Only look at early rounds
    
    if (event.type === 'kill' || event.type === 'attack') {
      const payload = event.payload as { killer?: Player; attacker?: Player; victim?: Player };
      const players = [payload.killer, payload.attacker, payload.victim].filter(Boolean) as Player[];
      
      for (const player of players) {
        if (player.steamId && player.team && !playerToTeam.has(player.steamId)) {
          // Map the side to the team name at match start
          if (player.team === 'CT') {
            playerToTeam.set(player.steamId, initialCtTeam);
          } else if (player.team === 'TERRORIST') {
            playerToTeam.set(player.steamId, initialTTeam);
          }
        }
      }
    }
  }
  
  // Accumulate stats per player
  const players: Map<string, PlayerAccumulator> = new Map();
  
  // Helper to get or create player accumulator
  const getPlayer = (player: Player): PlayerAccumulator | null => {
    if (!player.steamId) return null;
    
    const key = player.steamId;
    if (!players.has(key)) {
      // Determine which team this player is on
      let teamName = playerToTeam.get(key);
      
      // If not found yet, assign based on current side and early round logic
      if (!teamName && player.team) {
        if (player.team === 'CT') {
          teamName = initialCtTeam;
        } else if (player.team === 'TERRORIST') {
          teamName = initialTTeam;
        }
        if (teamName) {
          playerToTeam.set(key, teamName);
        }
      }
      
      if (!teamName || teamName === 'Unassigned' || teamName === 'Spectator') {
        return null;
      }
      
      players.set(key, {
        name: player.name,
        steamId: player.steamId,
        originalTeam: teamName,
        kills: 0,
        deaths: 0,
        assists: 0,
        damage: 0,
        headshotKills: 0,
      });
    }
    return players.get(key)!;
  };
  
  // Process all events
  for (const event of events) {
    if (event.type === 'kill') {
      const payload = event.payload as {
        killer: Player;
        victim: Player;
        headshot: boolean;
      };
      
      if (payload.killer) {
        const killer = getPlayer(payload.killer);
        if (killer) {
          killer.kills++;
          if (payload.headshot) {
            killer.headshotKills++;
          }
        }
      }
      
      if (payload.victim) {
        const victim = getPlayer(payload.victim);
        if (victim) {
          victim.deaths++;
        }
      }
    }
    
    if (event.type === 'attack') {
      const payload = event.payload as {
        attacker: Player;
        victim: Player;
        damage: number;
      };
      
      // Only count damage to enemies (different teams)
      if (payload.attacker && payload.victim && 
          payload.attacker.team !== payload.victim.team) {
        const attacker = getPlayer(payload.attacker);
        if (attacker) {
          attacker.damage += payload.damage || 0;
        }
      }
    }
    
    if (event.type === 'assist' || event.type === 'flash_assist') {
      const payload = event.payload as {
        assister: Player;
      };
      
      if (payload.assister) {
        const assister = getPlayer(payload.assister);
        if (assister) {
          assister.assists++;
        }
      }
    }
  }
  
  // Convert to PlayerStats and group by team
  const teamPlayers: Map<string, PlayerStats[]> = new Map();
  
  for (const player of players.values()) {
    const stats: PlayerStats = {
      name: player.name,
      steamId: player.steamId,
      kills: player.kills,
      deaths: player.deaths,
      assists: player.assists,
      adr: Math.round((player.damage / totalRounds) * 10) / 10,
      hsPercent: player.kills > 0 
        ? Math.round((player.headshotKills / player.kills) * 100) 
        : 0,
    };
    
    const teamName = player.originalTeam;
    
    if (!teamPlayers.has(teamName)) {
      teamPlayers.set(teamName, []);
    }
    teamPlayers.get(teamName)!.push(stats);
  }
  
  // Sort players by kills (descending) within each team
  for (const [, playerList] of teamPlayers) {
    playerList.sort((a, b) => b.kills - a.kills);
  }
  
  // Build response - Reihenfolge muss mit MatchHeader übereinstimmen!
  // matchData.teams.ct = Team 1 (links im Header)
  // matchData.teams.t = Team 2 (rechts im Header)
  const team1Players = teamPlayers.get(matchData.teams.ct.name) || [];
  const team2Players = teamPlayers.get(matchData.teams.t.name) || [];
  
  return { 
    teams: [
      { name: matchData.teams.ct.name, players: team1Players },
      { name: matchData.teams.t.name, players: team2Players },
    ]
  };
}
