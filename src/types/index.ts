// Shared types between frontend and backend

export interface Player {
  name: string;
  id: number;
  steamId: string;
  team: string | null;
}

export interface GameEvent {
  ts: number;
  type: string;
  round: number | null;
  raw: string;
  payload: Record<string, unknown>;
}

export interface KillPayload {
  killer: Player;
  killerPos: number[] | null;
  victim: Player;
  victimPos: number[] | null;
  weapon: string | null;
  headshot: boolean;
}

export interface AttackPayload {
  attacker: Player;
  attackerPos: number[] | null;
  victim: Player;
  victimPos: number[] | null;
  weapon: string | null;
  damage: number;
  damageArmor: number;
  healthRemaining: number;
  armorRemaining: number;
  hitgroup: string | null;
}

export interface AssistPayload {
  assister: Player;
  victim: Player;
}

export interface WorldTriggerPayload {
  trigger: string;
  map?: string;
}

export interface TeamScoredPayload {
  team: string;
  score: number;
  players: number;
}

export interface TeamPlayingPayload {
  side: string;
  teamName: string;
}

export interface MatchStatusPayload {
  ctTeam?: string;
  tTeam?: string;
  ctScore?: number;
  tScore?: number;
  map?: string;
  roundsPlayed?: number;
}

// API Response types
export interface MatchData {
  map: string;
  date: string;
  teams: {
    ct: { name: string; score: number };
    t: { name: string; score: number };
  };
  totalRounds: number;
}

export interface PlayerStats {
  name: string;
  steamId: string;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  hsPercent: number;
}

export interface TeamScoreboard {
  name: string;
  players: PlayerStats[];
}

export interface ScoreboardData {
  teams: TeamScoreboard[];
}
