import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getScoreboard } from './_lib/stats/scoreboard.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const scoreboard = getScoreboard();
    res.status(200).json(scoreboard);
  } catch (error) {
    console.error('Error getting scoreboard:', error);
    res.status(500).json({ error: 'Failed to get scoreboard' });
  }
}
