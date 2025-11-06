import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, Library, Search, TrendingUp, Heart, LogOut, BookMarked, CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/my-books', label: 'My Books', icon: Library },
    { to: '/discover', label: 'Discover', icon: Search },
    { to: '/currently-reading', label: 'Currently Reading', icon: BookOpen },
    { to: '/want-to-read', label: 'Want to Read', icon: BookMarked },
    { to: '/completed', label: 'Completed', icon: CheckCircle2 },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/reading-stats', label: 'Stats', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                BookTracker
              </span>
            </Link>

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      {user && (
        <nav className="border-b bg-card">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                
                return (
                  <Link key={item.to} to={item.to}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-2 whitespace-nowrap",
                        isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 BookTracker. Track your reading journey.</p>
        </div>
      </footer>
    </div>
  );
}
