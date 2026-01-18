import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import { TeamScoreboard } from './TeamScoreboard';
import type { ScoreboardData } from '../types';

interface ScoreboardProps {
  scoreboard: ScoreboardData;
}

export function Scoreboard({ scoreboard }: ScoreboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Individual player performance across the match.</CardDescription>
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
