import { useState } from 'react';
import { useMatchData } from '../hooks/useMatchData';
import { MatchHeader } from '../components/MatchHeader';
import { Scoreboard } from '../components/Scoreboard';
import { ProgressionChart } from '../components/ProgressionChart';
import { PlayerSpotlight } from '../components/PlayerSpotlight';
import { RoundsChart } from '../components/RoundsChart';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

type Tab = 'scoreboard' | 'progression' | 'players' | 'rounds';

export function MatchPage() {
  const { match, scoreboard, progression, rounds, loading, error } = useMatchData();
  const [activeTab, setActiveTab] = useState<Tab>('scoreboard');

  if (loading) {
    return (
      <>
        <main className="h-screen p-4 md:p-8 overflow-auto">
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
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <main className="h-screen p-4 md:p-8 overflow-auto">
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
        </main>
        <Footer />
      </>
    );
  }

  if (!match || !scoreboard || !progression || !rounds) {
    return null;
  }

  return (
    <>
      {/* Main Content - fixed height, footer always below the fold */}
      <main className="h-screen p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <MatchHeader match={match} />
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-0.5 md:gap-3">
            <Button
              variant={activeTab === 'scoreboard' ? 'tabActive' : 'tab'}
              onClick={() => setActiveTab('scoreboard')}
            >
              <span className="md:hidden">Stats</span>
              <span className="hidden md:inline">Match Stats</span>
            </Button>
            <Button
              variant={activeTab === 'progression' ? 'tabActive' : 'tab'}
              onClick={() => setActiveTab('progression')}
            >
              <span className="md:hidden">Progression</span>
              <span className="hidden md:inline">Score Progression</span>
            </Button>
            <Button
              variant={activeTab === 'players' ? 'tabActive' : 'tab'}
              onClick={() => setActiveTab('players')}
            >
              <span className="md:hidden">Player</span>
              <span className="hidden md:inline">Player Spotlight</span>
            </Button>
            <Button
              variant={activeTab === 'rounds' ? 'tabActive' : 'tab'}
              onClick={() => setActiveTab('rounds')}
            >
              <span className="md:hidden">Duration</span>
              <span className="hidden md:inline">Round Durations</span>
            </Button>
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
      </main>
      
      <Footer />
    </>
  );
}
