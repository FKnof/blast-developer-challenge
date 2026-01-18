// Noise patterns to skip - lines that will never be useful
const NOISE_PATTERNS = [
  'server_cvar',
  'Your server needs to be restarted',
  'GOTV',
  '[FACEIT]',
  'STEAM USERID validated',
  'killed other',
  'Molotov projectile',
  'entered the game',
  'connected, address',
];

export interface NormalizedLine {
  ts: number;
  message: string;
  raw: string;
}

/**
 * Check if a line is noise and should be skipped
 */
export function isNoise(line: string): boolean {
  if (!line.trim()) return true;
  return NOISE_PATTERNS.some(pattern => line.includes(pattern));
}

/**
 * Normalize a log line by extracting timestamp and message
 * Format: "MM/DD/YYYY - HH:MM:SS: message"
 */
export function normalizeLine(line: string): NormalizedLine | null {
  // Remove Windows line endings
  const cleanLine = line.replace(/\r$/, '');
  
  const colonIndex = cleanLine.indexOf(': ');
  if (colonIndex === -1 || colonIndex < 20) return null;
  
  const timestampStr = cleanLine.slice(0, colonIndex);
  const message = cleanLine.slice(colonIndex + 2);
  
  // Parse "MM/DD/YYYY - HH:MM:SS" format
  const match = timestampStr.match(/^(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  
  const [, month, day, year, hour, minute, second] = match;
  const ts = Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  
  if (isNaN(ts)) return null;
  
  return { ts, message, raw: cleanLine };
}
