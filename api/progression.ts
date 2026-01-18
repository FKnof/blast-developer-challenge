import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProgression } from './_lib/stats/progression.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const progression = getProgression();
    res.json(progression);
  } catch (error) {
    console.error('Error getting progression:', error);
    res.status(500).json({ error: 'Failed to get progression data' });
  }
}
