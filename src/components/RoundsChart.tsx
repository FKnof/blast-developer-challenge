import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import type { RoundsData } from '../types';

interface RoundsChartProps {
  data: RoundsData;
}

export function RoundsChart({ data }: RoundsChartProps) {
  const { rounds, averageDuration, team1, team2 } = data;

  // Format seconds to mm:ss (for X-axis)
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format with "min" suffix (for labels and stats)
  const formatDurationWithUnit = (seconds: number) => {
    return `${formatDuration(seconds)} min`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const round = payload[0].payload;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <div className="font-semibold mb-1">Round {round.round}</div>
        <div className="text-muted-foreground">
          Duration: <span className="text-foreground font-medium">{formatDurationWithUnit(round.duration)}</span>
        </div>
        <div className="text-muted-foreground">
          Winner: <span className="text-foreground font-medium">{round.winner}</span> ({round.winnerSide})
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>Duration of each round. Color indicates the winning team.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex justify-center gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: 'hsl(var(--chart-1))' }}
            />
            <span>{team1.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: 'hsl(var(--chart-2))' }}
            />
            <span>{team2.name}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rounds}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis 
                type="number"
                tickFormatter={formatDuration}
                domain={[0, 'dataMax']}
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey="round"
                tickFormatter={(v) => `R${v}`}
                fontSize={12}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="duration" 
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
              >
                {rounds.map((round, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={round.winner === team1.name 
                      ? 'hsl(var(--chart-1))' 
                      : 'hsl(var(--chart-2))'
                    }
                  />
                ))}
              </Bar>
              {/* Average duration reference line */}
              <ReferenceLine
                x={averageDuration}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Avg ${formatDurationWithUnit(averageDuration)}`,
                  position: 'top',
                  fontSize: 11,
                  fill: 'hsl(var(--muted-foreground))',
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-center text-sm">
          <div>
            <div className="text-muted-foreground">Shortest</div>
            <div className="font-semibold">
              {rounds.length > 0 
                ? formatDurationWithUnit(Math.min(...rounds.map(r => r.duration)))
                : '-'
              }
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Average</div>
            <div className="font-semibold">{formatDurationWithUnit(averageDuration)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Longest</div>
            <div className="font-semibold">
              {rounds.length > 0 
                ? formatDurationWithUnit(Math.max(...rounds.map(r => r.duration)))
                : '-'
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
