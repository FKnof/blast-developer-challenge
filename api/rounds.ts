import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoundsData } from './_lib/stats/rounds.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const data = getRoundsData();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting rounds data:', error);
    res.status(500).json({ error: 'Failed to get rounds data' });
  }
}
