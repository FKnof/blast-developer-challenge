import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import type { TeamScoreboard as TeamScoreboardType } from '../types';

interface TeamScoreboardProps {
  team: TeamScoreboardType;
}

export function TeamScoreboard({ team }: TeamScoreboardProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold px-2">{team.name}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead className="text-right w-12">K</TableHead>
            <TableHead className="text-right w-12">D</TableHead>
            <TableHead className="text-right w-14">+/-</TableHead>
            <TableHead className="text-right w-16 hidden sm:table-cell">ADR</TableHead>
            <TableHead className="text-right w-14 hidden sm:table-cell">HS%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.players.map((player) => {
            const diff = player.kills - player.deaths;
            return (
              <TableRow key={player.steamId}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell className="text-right tabular-nums">{player.kills}</TableCell>
                <TableCell className="text-right tabular-nums">{player.deaths}</TableCell>
                <TableCell
                  className={`text-right tabular-nums ${
                    diff > 0
                      ? 'text-green-600'
                      : diff < 0
                      ? 'text-red-600'
                      : ''
                  }`}
                >
                  {diff > 0 ? `+${diff}` : diff}
                </TableCell>
                <TableCell className="text-right tabular-nums hidden sm:table-cell">
                  {player.adr}
                </TableCell>
                <TableCell className="text-right tabular-nums hidden sm:table-cell">
                  {player.hsPercent}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
