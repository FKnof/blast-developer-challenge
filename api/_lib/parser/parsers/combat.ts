import type { GameEvent } from '../../../../src/types/index.js';
import type { NormalizedLine } from '../normalize.js';
import { parsePlayer, parsePositionFromSegment, extractQuoted, extractLabeledNumber, extractLabeledValue } from '../helpers.js';

/**
 * Parse a kill event
 * Format: "killer" [pos] killed "victim" [pos] with "weapon" (headshot)
 */
export function parseKill(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  const killIndex = message.indexOf(' killed ');
  if (killIndex === -1) return null;
  
  const left = message.slice(0, killIndex);
  const right = message.slice(killIndex + 8);
  
  const killer = parsePlayer(left);
  const killerPos = parsePositionFromSegment(left);
  
  const withIndex = right.indexOf(' with ');
  if (withIndex === -1) return null;
  
  const victimPart = right.slice(0, withIndex);
  const weaponPart = right.slice(withIndex + 6);
  
  const victim = parsePlayer(victimPart);
  const victimPos = parsePositionFromSegment(victimPart);
  const weapon = extractQuoted(weaponPart);
  const headshot = message.includes('(headshot)');
  
  if (!killer || !victim) return null;
  
  return {
    ts,
    type: 'kill',
    round,
    raw,
    payload: {
      killer,
      killerPos,
      victim,
      victimPos,
      weapon,
      headshot,
    },
  };
}

/**
 * Parse an attack (damage) event
 * Format: "attacker" [pos] attacked "victim" [pos] with "weapon" (damage "X") (damage_armor "X") (health "X") (armor "X") (hitgroup "X")
 */
export function parseAttack(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  const attackIndex = message.indexOf(' attacked ');
  if (attackIndex === -1) return null;
  
  const left = message.slice(0, attackIndex);
  const right = message.slice(attackIndex + 10);
  
  const attacker = parsePlayer(left);
  const attackerPos = parsePositionFromSegment(left);
  
  const withIndex = right.indexOf(' with ');
  if (withIndex === -1) return null;
  
  const victimPart = right.slice(0, withIndex);
  const restPart = right.slice(withIndex + 6);
  
  const victim = parsePlayer(victimPart);
  const victimPos = parsePositionFromSegment(victimPart);
  const weapon = extractQuoted(restPart);
  
  const damage = extractLabeledNumber(restPart, 'damage') ?? 0;
  const damageArmor = extractLabeledNumber(restPart, 'damage_armor') ?? 0;
  const healthRemaining = extractLabeledNumber(restPart, 'health') ?? 0;
  const armorRemaining = extractLabeledNumber(restPart, 'armor') ?? 0;
  const hitgroup = extractLabeledValue(restPart, 'hitgroup');
  
  if (!attacker || !victim) return null;
  
  return {
    ts,
    type: 'attack',
    round,
    raw,
    payload: {
      attacker,
      attackerPos,
      victim,
      victimPos,
      weapon,
      damage,
      damageArmor,
      healthRemaining,
      armorRemaining,
      hitgroup,
    },
  };
}

/**
 * Parse an assist event
 * Format: "player" assisted killing "victim"
 */
export function parseAssist(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  const assistIndex = message.indexOf(' assisted killing ');
  if (assistIndex === -1) return null;
  
  const left = message.slice(0, assistIndex);
  const right = message.slice(assistIndex + 18);
  
  const assister = parsePlayer(left);
  const victim = parsePlayer(right);
  
  if (!assister || !victim) return null;
  
  return {
    ts,
    type: 'assist',
    round,
    raw,
    payload: {
      assister,
      victim,
    },
  };
}

/**
 * Parse a flash assist event
 * Format: "player" flash-assisted killing "victim"
 */
export function parseFlashAssist(
  { ts, message, raw }: NormalizedLine,
  round: number | null
): GameEvent | null {
  const assistIndex = message.indexOf(' flash-assisted killing ');
  if (assistIndex === -1) return null;
  
  const left = message.slice(0, assistIndex);
  const right = message.slice(assistIndex + 24);
  
  const assister = parsePlayer(left);
  const victim = parsePlayer(right);
  
  if (!assister || !victim) return null;
  
  return {
    ts,
    type: 'flash_assist',
    round,
    raw,
    payload: {
      assister,
      victim,
    },
  };
}
