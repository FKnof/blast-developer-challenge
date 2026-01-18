import type { GameEvent } from '../../../../src/types/index.js';
import type { NormalizedLine } from '../normalize.js';
import { extractAllQuoted } from '../helpers.js';

/**
 * Parse a team scored event
 * Format: Team "CT" scored "X" with "Y" players
 */
export function parseTeamScored(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  const quoted = extractAllQuoted(message);
  if (quoted.length < 2) return null;
  
  const team = quoted[0]; // "CT" or "TERRORIST"
  const score = parseInt(quoted[1], 10);
  const players = quoted.length >= 3 ? parseInt(quoted[2], 10) : 0;
  
  if (isNaN(score)) return null;
  
  return {
    ts,
    type: 'team_scored',
    round,
    raw,
    payload: {
      team,
      score,
      players,
    },
  };
}

/**
 * Parse a team triggered event
 * Format: Team "CT" triggered "SFUI_Notice_CTs_Win" (CT "X") (T "Y")
 */
export function parseTeamTriggered(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  const quoted = extractAllQuoted(message);
  if (quoted.length < 2) return null;
  
  const team = quoted[0];
  const trigger = quoted[1];
  
  // Extract scores if present
  const ctMatch = message.match(/\(CT "(\d+)"\)/);
  const tMatch = message.match(/\(T "(\d+)"\)/);
  
  const ctScore = ctMatch ? parseInt(ctMatch[1], 10) : null;
  const tScore = tMatch ? parseInt(tMatch[1], 10) : null;
  
  return {
    ts,
    type: 'team_triggered',
    round,
    raw,
    payload: {
      team,
      trigger,
      ...(ctScore !== null && { ctScore }),
      ...(tScore !== null && { tScore }),
    },
  };
}

/**
 * Parse a team playing event
 * Format: Team playing "CT": TeamName
 */
export function parseTeamPlaying(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  const sideMatch = message.match(/Team playing "([^"]+)":\s*(.+)$/);
  if (!sideMatch) return null;
  
  const side = sideMatch[1]; // "CT" or "TERRORIST"
  const teamName = sideMatch[2].trim();
  
  return {
    ts,
    type: 'team_playing',
    round,
    raw,
    payload: {
      side,
      teamName,
    },
  };
}

/**
 * Parse a match status event
 * Format: MatchStatus: Team playing "CT": TeamName
 *         MatchStatus: Score: X:Y on map "mapname" RoundsPlayed: Z
 */
export function parseMatchStatus(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  const content = message.slice('MatchStatus: '.length).trim();
  
  // Score format
  const scoreMatch = content.match(/Score: (\d+):(\d+) on map "([^"]+)" RoundsPlayed: (-?\d+)/);
  if (scoreMatch) {
    return {
      ts,
      type: 'match_status_score',
      round,
      raw,
      payload: {
        ctScore: parseInt(scoreMatch[1], 10),
        tScore: parseInt(scoreMatch[2], 10),
        map: scoreMatch[3],
        roundsPlayed: parseInt(scoreMatch[4], 10),
      },
    };
  }
  
  // Team playing format: Team playing "CT": TeamVitality
  const teamMatch = content.match(/Team playing "([^"]+)":\s*(.+)$/);
  if (teamMatch) {
    return {
      ts,
      type: 'match_status_team',
      round,
      raw,
      payload: {
        side: teamMatch[1],
        teamName: teamMatch[2].trim(),
      },
    };
  }
  
  return {
    ts,
    type: 'match_status',
    round,
    raw,
    payload: { content },
  };
}
