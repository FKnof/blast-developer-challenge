import { Card, CardContent } from './ui/card';
import type { MatchData } from '../types';

interface MatchHeaderProps {
  match: MatchData;
}

export function MatchHeader({ match }: MatchHeaderProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Teams and Score */}
          <div className="flex items-center justify-center gap-4 md:gap-8 w-full">
            {/* Team 1 */}
            <div className="flex-1 text-right">
              <h2 className="text-lg md:text-2xl font-bold truncate">
                {match.teams.ct.name}
              </h2>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-3xl md:text-5xl font-bold tabular-nums">
                {match.teams.ct.score}
              </span>
              <span className="text-xl md:text-3xl text-muted-foreground">:</span>
              <span className="text-3xl md:text-5xl font-bold tabular-nums">
                {match.teams.t.score}
              </span>
            </div>

            {/* Team 2 */}
            <div className="flex-1 text-left">
              <h2 className="text-lg md:text-2xl font-bold truncate">
                {match.teams.t.name}
              </h2>
            </div>
          </div>

          {/* Match Info */}
          <div className="text-sm text-muted-foreground">
            {match.map} • {formatDate(match.date)} • {match.totalRounds} rounds
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
