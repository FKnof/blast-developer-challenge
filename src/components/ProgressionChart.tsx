import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from './ui/chart';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';

export interface RoundDataPoint {
  round: number;
  team1Score: number;
  team2Score: number;
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
  
  // Custom Tooltip mit CT/T Info
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    const round = label as number;
    const isSecondHalf = round > halftimeRound;
    
    // Erste Hälfte: team1 = CT, team2 = T
    // Zweite Hälfte: team1 = T, team2 = CT
    const team1Side = isSecondHalf ? 'T' : 'CT';
    const team2Side = isSecondHalf ? 'CT' : 'T';
    
    const team1Data = payload.find((p: any) => p.dataKey === 'team1Score');
    const team2Data = payload.find((p: any) => p.dataKey === 'team2Score');
    
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-medium mb-2">Round {round}</p>
        {team1Data && (
          <div className="flex items-center gap-2 text-sm">
            <div 
              className="h-2.5 w-2.5 rounded-full" 
              style={{ backgroundColor: 'hsl(var(--chart-1))' }} 
            />
            <span>{team1.name}: {team1Data.value}</span>
            <span className="text-muted-foreground">({team1Side})</span>
          </div>
        )}
        {team2Data && (
          <div className="flex items-center gap-2 text-sm">
            <div 
              className="h-2.5 w-2.5 rounded-full" 
              style={{ backgroundColor: 'hsl(var(--chart-2))' }} 
            />
            <span>{team2.name}: {team2Data.value}</span>
            <span className="text-muted-foreground">({team2Side})</span>
          </div>
        )}
      </div>
    );
  };

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
        <CardDescription>How did the match evolve round by round?</CardDescription>
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
            
            <Tooltip content={<CustomTooltip />} />
            
            <ChartLegend content={<ChartLegendContent />} />
            
            {/* Team 1 Linie */}
            <Line
              type="linear"
              dataKey="team1Score"
              stroke="var(--color-team1Score)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-team1Score)', r: 3 }}
              activeDot={{ r: 5 }}
            />
            
            {/* Team 2 Linie */}
            <Line
              type="linear"
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
