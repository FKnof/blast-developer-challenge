import type { EventRoute } from './types.js';
import { parseKill, parseAttack, parseAssist, parseFlashAssist } from './parsers/combat.js';
import { parseWorldTrigger, parseFreezePeriod } from './parsers/world.js';
import { parseTeamScored, parseTeamTriggered, parseTeamPlaying, parseMatchStatus } from './parsers/team.js';

/**
 * Event routes ordered from most specific to most general
 * Uses cheap string checks (includes) for routing - no regex
 */
export const EVENT_ROUTES: EventRoute[] = [
  // Combat events
  {
    type: 'kill',
    test: msg => msg.includes(' killed ') && !msg.includes('killed other'),
    parse: parseKill,
  },
  {
    type: 'attack',
    test: msg => msg.includes(' attacked '),
    parse: parseAttack,
  },
  {
    type: 'flash_assist',
    test: msg => msg.includes(' flash-assisted killing '),
    parse: parseFlashAssist,
  },
  {
    type: 'assist',
    test: msg => msg.includes(' assisted killing '),
    parse: parseAssist,
  },
  
  // World triggers
  {
    type: 'world_trigger',
    test: msg => msg.startsWith('World triggered'),
    parse: parseWorldTrigger,
  },
  {
    type: 'freeze_period',
    test: msg => msg.startsWith('Starting Freeze period'),
    parse: parseFreezePeriod,
  },
  
  // Team events
  {
    type: 'team_scored',
    test: msg => msg.startsWith('Team ') && msg.includes(' scored '),
    parse: parseTeamScored,
  },
  {
    type: 'team_triggered',
    test: msg => msg.startsWith('Team ') && msg.includes(' triggered '),
    parse: parseTeamTriggered,
  },
  {
    type: 'team_playing',
    test: msg => msg.startsWith('Team playing'),
    parse: parseTeamPlaying,
  },
  {
    type: 'match_status',
    test: msg => msg.startsWith('MatchStatus:'),
    parse: parseMatchStatus,
  },
];
