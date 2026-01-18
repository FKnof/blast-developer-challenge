import type { Player } from '../../../src/types/index.js';

/**
 * Parse a player segment from a log line
 * Format: "PlayerName<ID><SteamID><Team>"
 */
export function parsePlayer(segment: string): Player | null {
  const match = segment.match(/"([^"]+)<(\d+)><([^>]+)><([^>]*)>"/);
  if (!match) return null;
  
  return {
    name: match[1].trim(),
    id: Number(match[2]),
    steamId: match[3],
    team: match[4] || null,
  };
}

/**
 * Extract position from a segment
 * Format: [x y z]
 */
export function parsePositionFromSegment(segment: string): number[] | null {
  const match = segment.match(/\[([^\]]+)\]/);
  if (!match) return null;
  return match[1].split(' ').map(Number);
}

/**
 * Extract the first quoted string from a segment
 */
export function extractQuoted(segment: string): string | null {
  const match = segment.match(/"([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Extract all quoted strings from a segment
 */
export function extractAllQuoted(segment: string): string[] {
  const matches = segment.match(/"([^"]+)"/g);
  if (!matches) return [];
  return matches.map(m => m.slice(1, -1));
}

/**
 * Extract a value in parentheses with a label
 * Format: (label "value") or (label value)
 */
export function extractLabeledValue(segment: string, label: string): string | null {
  const pattern = new RegExp(`\\(${label}\\s+"?([^"\\)]+)"?\\)`);
  const match = segment.match(pattern);
  return match ? match[1] : null;
}

/**
 * Extract numeric value in parentheses with a label
 */
export function extractLabeledNumber(segment: string, label: string): number | null {
  const value = extractLabeledValue(segment, label);
  if (value === null) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}
