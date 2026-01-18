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
  totalDuration: number; // in seconds
}

export interface PlayerStats {
  name: string;
  steamId: string;
  team: string;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  hsPercent: number;
  kpr: number;       // Kills per Round
  plusMinus: number; // Kill differential (K - D)
}

export interface TeamScoreboard {
  name: string;
  players: PlayerStats[];
}

export interface MatchAverages {
  kpr: number;
  adr: number;
  hsPercent: number;
  plusMinus: number;
}

export interface ScoreboardData {
  teams: TeamScoreboard[];
  matchAverages: MatchAverages;
  totalRounds: number;
}

// Progression types
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

// Rounds types
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
