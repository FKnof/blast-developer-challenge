import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from './ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

export interface RoundDataPoint {
  round: number;
  team1Score: number;
  team2Score: number;
  winner: 'team1' | 'team2' | null;
  winnerSide: 'CT' | 'T' | null;
}

export interface ProgressionData {
  team1: { name: string };
  team2: { name: string };
  halftimeRound: number;
  rounds: RoundDataPoint[];
}

interface ProgressionChartProps {
  data: ProgressionData;
}

export function ProgressionChart({ data }: ProgressionChartProps) {
  const { team1, team2, halftimeRound, rounds } = data;

  // Chart-Konfiguration mit Team-Namen und Farben
  const chartConfig: ChartConfig = {
    team1Score: {
      label: team1.name,
      color: 'hsl(var(--chart-1))',
    },
    team2Score: {
      label: team2.name,
      color: 'hsl(var(--chart-2))',
    },
  };

  // Finde den höchsten Score für die Y-Achse
  const maxScore = Math.max(
    ...rounds.map(r => Math.max(r.team1Score, r.team2Score)),
    16 // Minimum 16 anzeigen (Siegbedingung)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Progression</CardTitle>
        <CardDescription>
          How did the match evolve round by round?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart
            data={rounds}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            
            <XAxis
              dataKey="round"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{ value: 'Round', position: 'insideBottom', offset: -5 }}
            />
            
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, maxScore]}
              ticks={[0, 4, 8, 12, 16]}
            />
            
            {/* Halftime-Marker */}
            <ReferenceLine
              x={halftimeRound}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              label={{
                value: 'Halftime',
                position: 'top',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12,
              }}
            />
            
            {/* Horizontale Linie bei 16 (Siegbedingung) */}
            <ReferenceLine
              y={16}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="2 2"
              strokeOpacity={0.5}
            />
            
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Round ${value}`}
                />
              }
            />
            
            <ChartLegend content={<ChartLegendContent />} />
            
            {/* Team 1 Linie */}
            <Line
              type="stepAfter"
              dataKey="team1Score"
              stroke="var(--color-team1Score)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-team1Score)', r: 3 }}
              activeDot={{ r: 5 }}
            />
            
            {/* Team 2 Linie */}
            <Line
              type="stepAfter"
              dataKey="team2Score"
              stroke="var(--color-team2Score)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-team2Score)', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
