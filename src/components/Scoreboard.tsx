import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TeamScoreboard } from './TeamScoreboard';
import type { ScoreboardData } from '../types';

interface ScoreboardProps {
  scoreboard: ScoreboardData;
}

export function Scoreboard({ scoreboard }: ScoreboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scoreboard.teams.map((team) => (
            <TeamScoreboard key={team.name} team={team} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
