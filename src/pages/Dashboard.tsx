import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Hero } from '@/components/Hero';
import { StatCard } from '@/components/StatCard';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { bookService } from '@/services/bookService';
import { readingService } from '@/services/readingService';
import { Book, ReadingStats, ReadingChallenge } from '@/types/book';
import { BookOpen, Clock, Flame, Star, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProgressBar } from '@/components/ProgressBar';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentlyReading, setCurrentlyReading] = useState<Book[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [challenge, setChallenge] = useState<ReadingChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [booksData, statsData, challengeData] = await Promise.all([
        bookService.getByStatus(user.id, 'currently-reading'),
        readingService.getStats(user.id),
        readingService.getChallenge(user.id),
      ]);

      setCurrentlyReading(booksData.slice(0, 3));
      setStats(statsData);
      setChallenge(challengeData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (id: string, isFavorite: boolean) => {
    try {
      await bookService.toggleFavorite(id, isFavorite);
      await loadDashboardData();
      toast({
        title: isFavorite ? 'Added to favorites' : 'Removed from favorites',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorite status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your reading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero */}
        <Hero title="Your Reading Dashboard" subtitle="Track your progress and discover new books" />

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Books Read"
            value={stats?.booksRead || 0}
            icon={BookOpen}
          />
          <StatCard
            title="Reading Time"
            value={`${stats?.readingTime || 0}h`}
            icon={Clock}
          />
          <StatCard
            title="Current Streak"
            value={`${stats?.currentStreak || 0} days`}
            icon={Flame}
          />
          <StatCard
            title="Avg Rating"
            value={stats?.averageRating.toFixed(1) || '0.0'}
            icon={Star}
          />
        </div>

        {/* Reading Challenge */}
        {challenge && (
          <div className="bg-card rounded-lg p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{challenge.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {challenge.current} of {challenge.target} books completed
                </p>
              </div>
              <Button onClick={() => navigate('/reading-stats')}>
                View Stats <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <ProgressBar value={challenge.current} max={challenge.target} />
          </div>
        )}

        {/* Currently Reading */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Currently Reading</h2>
            <Button variant="outline" onClick={() => navigate('/currently-reading')}>
              View All
            </Button>
          </div>

          {currentlyReading.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You're not reading any books yet</p>
              <Button onClick={() => navigate('/discover')}>Discover Books</Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentlyReading.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onFavoriteToggle={handleFavoriteToggle}
                  onViewDetails={(id) => navigate(`/book/${id}`)}
                  showProgress
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-24 text-lg"
            onClick={() => navigate('/discover')}
          >
            Discover New Books
          </Button>
          <Button
            variant="outline"
            className="h-24 text-lg"
            onClick={() => navigate('/add-book')}
          >
            Add Book Manually
          </Button>
          <Button
            variant="outline"
            className="h-24 text-lg"
            onClick={() => navigate('/my-books')}
          >
            Browse My Library
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
