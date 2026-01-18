import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GameEvent } from '../../../src/types/index.js';
import type { ParseResult, ParserStats } from './types.js';
import { isNoise, normalizeLine } from './normalize.js';
import { EVENT_ROUTES } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse a single line and return a GameEvent or null
 */
export function parseLine(
  line: string,
  currentRound: number | null
): GameEvent | null {
  // Skip noise early
  if (isNoise(line)) return null;
  
  // Normalize the line
  const ctx = normalizeLine(line);
  if (!ctx) return null;
  
  // Try each route in order
  for (const route of EVENT_ROUTES) {
    if (!route.test(ctx.message)) continue;
    
    const event = route.parse(ctx, currentRound);
    if (event) return event;
    
    // Route matched but parse failed - malformed
    return {
      ts: ctx.ts,
      type: `malformed_${route.type}`,
      round: currentRound,
      raw: ctx.raw,
      payload: {},
    };
  }
  
  // No route matched - unknown event
  return {
    ts: ctx.ts,
    type: 'unknown',
    round: currentRound,
    raw: ctx.raw,
    payload: {},
  };
}

/**
 * Find the line index of the real match start
 * (last Match_Start with RoundsPlayed: 0)
 */
function findRealMatchStartIndex(lines: string[]): number {
  let lastMatchStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Match_Start') && line.includes('RoundsPlayed: 0')) {
      lastMatchStartIndex = i;
    }
  }
  
  // If not found, look for Match_Start followed by RoundsPlayed: 0 on the next status line
  if (lastMatchStartIndex === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Match_Start')) {
        // Check next few lines for RoundsPlayed: 0
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          if (lines[j].includes('RoundsPlayed: 0')) {
            lastMatchStartIndex = i;
          }
        }
      }
    }
  }
  
  return lastMatchStartIndex;
}

/**
 * Parse the entire log file
 */
export function parseLogFile(filePath?: string): ParseResult {
  const defaultPath = path.join(__dirname, '../../../data/NAVIvsVitaGF-Nuke.txt');
  const logPath = filePath || defaultPath;
  
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');
  
  const stats: ParserStats = {
    totalLines: lines.length,
    parsedEvents: 0,
    noiseLines: 0,
    unknownEvents: 0,
    malformedEvents: 0,
  };
  
  const events: GameEvent[] = [];
  let currentRound = 0;
  
  // Find the real match start
  const matchStartIndex = findRealMatchStartIndex(lines);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip lines before real match start
    if (matchStartIndex !== -1 && i < matchStartIndex) {
      if (isNoise(line)) {
        stats.noiseLines++;
      }
      continue;
    }
    
    // Skip noise
    if (isNoise(line)) {
      stats.noiseLines++;
      continue;
    }
    
    const event = parseLine(line, currentRound);
    
    if (!event) {
      stats.noiseLines++;
      continue;
    }
    
    // Track round number
    if (event.type === 'round_start') {
      currentRound++;
      event.round = currentRound;
    } else if (event.round === null || event.round === 0) {
      event.round = currentRound;
    }
    
    // Track stats
    if (event.type === 'unknown') {
      stats.unknownEvents++;
    } else if (event.type.startsWith('malformed_')) {
      stats.malformedEvents++;
    } else {
      stats.parsedEvents++;
    }
    
    events.push(event);
  }
  
  return { events, stats };
}

// Cache for parsed events
let cachedResult: ParseResult | null = null;

/**
 * Get parsed events (cached)
 */
export function getParsedEvents(): ParseResult {
  if (!cachedResult) {
    cachedResult = parseLogFile();
    console.log('Parser stats:', cachedResult.stats);
  }
  return cachedResult;
}
