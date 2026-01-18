import type { GameEvent } from '../../../../src/types/index.js';
import type { NormalizedLine } from '../normalize.js';
import { extractQuoted } from '../helpers.js';

/**
 * Parse a world trigger event
 * Format: World triggered "EventName" on "map"
 */
export function parseWorldTrigger(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  const trigger = extractQuoted(message);
  if (!trigger) return null;
  
  const onIndex = message.indexOf(' on ');
  const map = onIndex !== -1 ? extractQuoted(message.slice(onIndex)) : null;
  
  // Map trigger names to event types
  const typeMap: Record<string, string> = {
    'Round_Start': 'round_start',
    'Round_End': 'round_end',
    'Match_Start': 'match_start',
    'Game_Commencing': 'game_commencing',
    'Restart_Round_(1_second)': 'round_restart',
  };
  
  const eventType = typeMap[trigger] || 'world_trigger';
  
  return {
    ts,
    type: eventType,
    round,
    raw,
    payload: {
      trigger,
      ...(map && { map }),
    },
  };
}

/**
 * Parse freeze period start
 * Format: Starting Freeze period
 */
export function parseFreezePeriod(
  { ts, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  return {
    ts,
    type: 'freeze_period',
    round,
    raw,
    payload: {},
  };
}

/**
 * Parse game over event
 * Format: Game Over: competitive 1092904694 de_nuke score 6:16 after 50 min
 * 
 * This line contains the total match duration in minutes and the final score.
 */
export function parseGameOver(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  // Extract duration from "after X min" at the end
  const afterMatch = message.match(/after (\d+) min/);
  const durationMinutes = afterMatch ? parseInt(afterMatch[1], 10) : 0;
  
  // Extract map name (it's after the match ID and before "score")
  // Format: "competitive 1092904694 de_nuke score"
  const mapMatch = message.match(/competitive \d+ (\w+) score/);
  const map = mapMatch ? mapMatch[1] : null;
  
  // Extract final score
  const scoreMatch = message.match(/score (\d+):(\d+)/);
  const ctScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  const tScore = scoreMatch ? parseInt(scoreMatch[2], 10) : 0;
  
  return {
    ts,
    type: 'game_over',
    round,
    raw,
    payload: {
      durationMinutes,
      map,
      ctScore,
      tScore,
    },
  };
}
