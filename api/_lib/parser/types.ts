import type { GameEvent } from '../../../src/types/index.js';
import type { NormalizedLine } from './normalize.js';

export interface EventRoute {
  type: string;
  test: (msg: string) => boolean;
  parse: (ctx: NormalizedLine, round: number | null) => GameEvent | null;
}

export interface ParserStats {
  totalLines: number;
  parsedEvents: number;
  noiseLines: number;
  unknownEvents: number;
  malformedEvents: number;
}

export interface ParseResult {
  events: GameEvent[];
  stats: ParserStats;
}
