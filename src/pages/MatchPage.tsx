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
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

type Tab = 'scoreboard' | 'progression' | 'players' | 'rounds';

export function MatchPage() {
  const { match, scoreboard, progression, rounds, loading, error } = useMatchData();
  const [activeTab, setActiveTab] = useState<Tab>('scoreboard');

  if (loading) {
    return (
      <div className="flex flex-col pb-6">
        <main className="p-4 md:p-8">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col pb-6">
        <main className="p-4 md:p-8">
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
      </div>
    );
  }

  if (!match || !scoreboard || !progression || !rounds) {
    return null;
  }

  return (
    <div className="flex flex-col pb-6">
      <main className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <MatchHeader match={match} />
          
          {/* Tab Navigation */}
          <div className="flex gap-2 md:gap-3">
            <Button
              variant={activeTab === 'scoreboard' ? 'tabActive' : 'tab'}
              onClick={() => setActiveTab('scoreboard')}
              className="flex-1 sm:flex-none"
            >
              <BarChart3 className={activeTab === 'scoreboard' ? 'h-5 w-5 text-primary' : 'h-4 w-4'} />
              <span className="hidden sm:inline md:hidden">Stats</span>
              <span className="hidden md:inline text-xs lg:text-sm">Match Stats</span>
            </Button>
            <Button
              variant={activeTab === 'progression' ? 'tabActive' : 'tab'}
              onClick={() => setActiveTab('progression')}
              className="flex-1 sm:flex-none"
            >
              <TrendingUp className={activeTab === 'progression' ? 'h-5 w-5 text-primary' : 'h-4 w-4'} />
              <span className="hidden sm:inline md:hidden">Progression</span>
              <span className="hidden md:inline text-xs lg:text-sm">Score Progression</span>
            </Button>
            <Button
              variant={activeTab === 'players' ? 'tabActive' : 'tab'}
              onClick={() => setActiveTab('players')}
              className="flex-1 sm:flex-none"
            >
              <Users className={activeTab === 'players' ? 'h-5 w-5 text-primary' : 'h-4 w-4'} />
              <span className="hidden sm:inline md:hidden">Player</span>
              <span className="hidden md:inline text-xs lg:text-sm">Player Spotlight</span>
            </Button>
            <Button
              variant={activeTab === 'rounds' ? 'tabActive' : 'tab'}
              onClick={() => setActiveTab('rounds')}
              className="flex-1 sm:flex-none"
            >
              <Clock className={activeTab === 'rounds' ? 'h-5 w-5 text-primary' : 'h-4 w-4'} />
              <span className="hidden sm:inline md:hidden">Rounds</span>
              <span className="hidden md:inline text-xs lg:text-sm">Round Durations</span>
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
    </div>
  );
}
