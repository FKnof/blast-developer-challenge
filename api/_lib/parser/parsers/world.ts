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
