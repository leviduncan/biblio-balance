import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProgressBar } from '@/components/ProgressBar';
import { readingService } from '@/services/readingService';
import { useAuth } from '@/contexts/AuthContext';
import { ReadingStats, ReadingChallenge } from '@/types/book';
import { BookOpen, FileText, Clock, TrendingUp, Star, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function ReadingStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [challenge, setChallenge] = useState<ReadingChallenge | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [genreData, setGenreData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    loadStats();
  }, [user, selectedYear]);

  const loadStats = async () => {
    if (!user) return;
    try {
      const [statsData, challengeData, monthlyStats, genreDistribution] = await Promise.all([
        readingService.getStats(user.id),
        readingService.getChallenge(user.id),
        readingService.calculateMonthlyStats(user.id, parseInt(selectedYear)),
        readingService.getGenreDistribution(user.id),
      ]);

      setStats(statsData);
      setChallenge(challengeData);
      setMonthlyData(monthlyStats);
      setGenreData(genreDistribution);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--border))'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-amber-glow bg-clip-text text-transparent">
            Reading Statistics
          </h1>
          <p className="text-muted-foreground">Track your reading journey</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <StatCard
              title="Books Read"
              value={stats.booksRead}
              icon={BookOpen}
            />
            <StatCard
              title="Total Pages"
              value={stats.totalPages.toLocaleString()}
              icon={FileText}
            />
            <StatCard
              title="Reading Time"
              value={`${stats.readingTime}h`}
              icon={Clock}
            />
            <StatCard
              title="Current Streak"
              value={`${stats.currentStreak} days`}
              icon={TrendingUp}
            />
            <StatCard
              title="Average Rating"
              value={stats.averageRating.toFixed(1)}
              icon={Star}
            />
            <StatCard
              title="Challenge Progress"
              value={challenge ? `${challenge.current}/${challenge.target}` : '0/0'}
              icon={Target}
            />
          </div>
        ) : null}

        {loading ? (
          <Skeleton className="h-40 mb-8" />
        ) : challenge ? (
          <Card className="p-6 mb-8 shadow-card hover:shadow-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{challenge.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {challenge.current} of {challenge.target} books
                </p>
              </div>
              <div className="text-3xl font-bold bg-gradient-amber-glow bg-clip-text text-transparent">
                {Math.round((challenge.current / challenge.target) * 100)}%
              </div>
            </div>
            <ProgressBar value={challenge.current} max={challenge.target} />
          </Card>
        ) : null}

        <div className="flex justify-end mb-6">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-4">Monthly Reading Progress</h3>
            {loading ? (
              <Skeleton className="h-80" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="books" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-4">Genre Distribution</h3>
            {loading ? (
              <Skeleton className="h-80" />
            ) : genreData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No genre data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
