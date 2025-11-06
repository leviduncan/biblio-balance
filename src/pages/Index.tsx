import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Hero } from '@/components/Hero';
import { Card } from '@/components/ui/card';
import { BookOpen, TrendingUp, Heart, Target } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <Hero
          title="Track Your Reading Journey"
          subtitle="Organize your books, track your progress, and discover your next great read"
          ctaText="Get Started"
          ctaLink="/auth"
        />
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Track Your Reading</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center shadow-card hover:shadow-warm transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Organize Your Library</h3>
            <p className="text-sm text-muted-foreground">
              Keep track of books you want to read, are reading, and have completed
            </p>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-warm transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your reading progress with visual stats and insights
            </p>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-warm transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Rate & Review</h3>
            <p className="text-sm text-muted-foreground">
              Rate your books and write reviews to remember your thoughts
            </p>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-warm transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Set Goals</h3>
            <p className="text-sm text-muted-foreground">
              Challenge yourself with yearly reading goals and track your streaks
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
