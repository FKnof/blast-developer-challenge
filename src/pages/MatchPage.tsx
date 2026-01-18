import { useState } from 'react';
import { useMatchData } from '../hooks/useMatchData';
import { MatchHeader } from '../components/MatchHeader';
import { Scoreboard } from '../components/Scoreboard';
import { ProgressionChart } from '../components/ProgressionChart';
import { PlayerSpotlight } from '../components/PlayerSpotlight';
import { RoundsChart } from '../components/RoundsChart';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

type Tab = 'scoreboard' | 'progression' | 'players' | 'rounds';

export function MatchPage() {
  const { match, scoreboard, progression, rounds, loading, error } = useMatchData();
  const [activeTab, setActiveTab] = useState<Tab>('scoreboard');

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-48 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-48 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Error loading match data</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!match || !scoreboard || !progression || !rounds) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <MatchHeader match={match} />
        
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('scoreboard')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'scoreboard'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Match Stats
          </button>
          <button
            onClick={() => setActiveTab('progression')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'progression'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Score Progression
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'players'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Player Spotlight
          </button>
          <button
            onClick={() => setActiveTab('rounds')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'rounds'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Round Durations
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'scoreboard' && <Scoreboard scoreboard={scoreboard} />}
        {activeTab === 'progression' && <ProgressionChart data={progression} />}
        {activeTab === 'players' && (
          <PlayerSpotlight 
            teams={scoreboard.teams} 
            matchAverages={scoreboard.matchAverages} 
          />
        )}
        {activeTab === 'rounds' && <RoundsChart data={rounds} />}
      </div>
    </div>
  );
}
