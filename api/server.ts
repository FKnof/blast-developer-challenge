import express from 'express';
import cors from 'cors';
import { getMatchData } from './_lib/stats/match.js';
import { getScoreboard } from './_lib/stats/scoreboard.js';
import { getProgression } from './_lib/stats/progression.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/match', (_req, res) => {
  try {
    const matchData = getMatchData();
    res.json(matchData);
  } catch (error) {
    console.error('Error getting match data:', error);
    res.status(500).json({ error: 'Failed to get match data' });
  }
});

app.get('/api/scoreboard', (_req, res) => {
  try {
    const scoreboard = getScoreboard();
    res.json(scoreboard);
  } catch (error) {
    console.error('Error getting scoreboard:', error);
    res.status(500).json({ error: 'Failed to get scoreboard' });
  }
});

app.get('/api/progression', (_req, res) => {
  try {
    const progression = getProgression();
    res.json(progression);
  } catch (error) {
    console.error('Error getting progression:', error);
    res.status(500).json({ error: 'Failed to get progression data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
