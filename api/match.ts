import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMatchData } from './_lib/stats/match.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const matchData = getMatchData();
    res.status(200).json(matchData);
  } catch (error) {
    console.error('Error getting match data:', error);
    res.status(500).json({ error: 'Failed to get match data' });
  }
}
