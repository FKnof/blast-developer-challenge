import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Star, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import type { PlayerStats, MatchAverages, TeamScoreboard } from '../types';

interface PlayerSpotlightProps {
  teams: TeamScoreboard[];
  matchAverages: MatchAverages;
}

export function PlayerSpotlight({ teams, matchAverages }: PlayerSpotlightProps) {
  // Flatten all players for selection
  const allPlayers = teams.flatMap((team, teamIndex) => 
    team.players.map(player => ({ ...player, teamName: team.name, teamIndex }))
  );
  
  // Find MVP (highest KPR)
  const mvp = allPlayers.reduce((best, player) => 
    player.kpr > best.kpr ? player : best
  , allPlayers[0]);
  
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats & { teamName: string; teamIndex: number }>(
    allPlayers[0]
  );

  // Team color based on team index
  const teamColor = selectedPlayer.teamIndex === 0 
    ? 'hsl(var(--chart-1))' 
    : 'hsl(var(--chart-2))';

  // Prepare chart data with the 4 metrics
  // X-axis labels include avg in parentheses
  const chartData = [
    {
      name: `KPR\n(${matchAverages.kpr.toFixed(2)})`,
      label: selectedPlayer.kpr.toFixed(2),
      normalizedValue: matchAverages.kpr > 0 
        ? (selectedPlayer.kpr / matchAverages.kpr) * 100 
        : 100,
    },
    {
      name: `ADR\n(${matchAverages.adr.toFixed(0)})`,
      label: selectedPlayer.adr.toFixed(0),
      normalizedValue: matchAverages.adr > 0 
        ? (selectedPlayer.adr / matchAverages.adr) * 100 
        : 100,
    },
    {
      name: `HS%\n(${matchAverages.hsPercent}%)`,
      label: `${selectedPlayer.hsPercent}%`,
      normalizedValue: matchAverages.hsPercent > 0 
        ? (selectedPlayer.hsPercent / matchAverages.hsPercent) * 100 
        : 100,
    },
    {
      name: `+/-\n(${matchAverages.plusMinus > 0 ? '+' : ''}${matchAverages.plusMinus})`,
      label: selectedPlayer.plusMinus > 0 
        ? `+${selectedPlayer.plusMinus}` 
        : `${selectedPlayer.plusMinus}`,
      // For +/-, use raw value scaled
      normalizedValue: selectedPlayer.plusMinus * 10,
    },
  ];

  // Custom tick component for multi-line labels
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const lines = payload.value.split('\n');
    return (
      <g transform={`translate(${x},${y})`}>
        <text textAnchor="middle" fill="currentColor" fontSize={13} fontWeight={500}>
          <tspan x={0} dy={16}>{lines[0]}</tspan>
          <tspan x={0} dy={16} fontSize={11} fill="hsl(var(--muted-foreground))">
            {lines[1]}
          </tspan>
        </text>
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>Analyze individual player stats compared to match average.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Player Selector */}
        <div className="flex flex-col gap-4">
          {teams.map((team, teamIndex) => (
            <div key={team.name}>
              {/* Team name centered */}
              <div className="text-sm font-medium text-muted-foreground text-center mb-2">
                {team.name}
              </div>
              {/* Player grid - equal width buttons */}
              <div className="grid grid-cols-5 gap-2">
                {team.players.map(player => {
                  const isSelected = selectedPlayer.steamId === player.steamId;
                  const isMvp = player.steamId === mvp.steamId;
                  const color = teamIndex === 0 
                    ? 'hsl(var(--chart-1))' 
                    : 'hsl(var(--chart-2))';
                  
                  return (
                    <button
                      key={player.steamId}
                      onClick={() => setSelectedPlayer({ ...player, teamName: team.name, teamIndex })}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-lg border transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }
                      `}
                    >
                      {/* Avatar placeholder */}
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center relative"
                        style={{
                          backgroundColor: `${color}20`,
                          color: color,
                        }}
                      >
                        <User className="w-5 h-5" />
                        {/* MVP badge */}
                        {isMvp && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 absolute -top-1 -right-1" />
                        )}
                      </div>
                      
                      {/* Player name */}
                      <span className="text-xs font-medium text-center truncate w-full">
                        {player.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Player Stats - Side by side layout */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-[1fr_3fr] gap-6 items-center">
            {/* Left: Player info */}
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                style={{
                  backgroundColor: `${teamColor}20`,
                  color: teamColor,
                }}
              >
                <User className="w-10 h-10" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold">{selectedPlayer.name}</h3>
                {selectedPlayer.steamId === mvp.steamId && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              {selectedPlayer.steamId === mvp.steamId && (
                <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full">
                  MVP
                </span>
              )}
            </div>

            {/* Right: Vertical Bar Chart */}
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 30, right: 10, left: 10, bottom: 40 }}
                >
                  <XAxis 
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={<CustomXAxisTick />}
                    interval={0}
                  />
                  <YAxis 
                    hide
                    domain={[-100, 200]}
                  />
                  <Bar 
                    dataKey="normalizedValue" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                    fill={teamColor}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={teamColor} />
                    ))}
                    {/* Show real values on top of bars */}
                    <LabelList 
                      dataKey="label" 
                      position="top" 
                      style={{ 
                        fontSize: 14, 
                        fontWeight: 600,
                        fill: 'hsl(var(--foreground))',
                      }}
                    />
                  </Bar>
                  {/* Match Average reference line (horizontal) */}
                  <ReferenceLine
                    y={100}
                    stroke="hsl(var(--muted-foreground) / 0.5)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    label={{ 
                      value: 'Avg', 
                      position: 'left',
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                  />
                  {/* Zero line for +/- */}
                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--muted-foreground) / 0.3)"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
