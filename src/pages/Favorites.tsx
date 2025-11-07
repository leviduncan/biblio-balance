import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { BookCard } from '@/components/BookCard';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { bookService } from '@/services/bookService';
import { useAuth } from '@/contexts/AuthContext';
import { Book } from '@/types/book';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [sortedBooks, setSortedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date-added');

  useEffect(() => {
    loadBooks();
  }, [user]);

  useEffect(() => {
    sortBooks();
  }, [books, sortBy]);

  const loadBooks = async () => {
    if (!user) return;
    try {
      const data = await bookService.getFavorites(user.id);
      setBooks(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load favorites',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sortBooks = () => {
    let result = [...books];

    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date-added':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    setSortedBooks(result);
  };

  const handleUnfavorite = async (bookId: string) => {
    try {
      await bookService.toggleFavorite(bookId, false);
      toast({
        title: 'Removed from favorites',
        description: 'Book removed from your favorites',
      });
      loadBooks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update book',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in flex items-center gap-3">
          <Heart className="h-10 w-10 text-primary fill-primary" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-amber-glow bg-clip-text text-transparent">
              Your Favorite Books
            </h1>
            <p className="text-muted-foreground">Your curated collection of beloved books</p>
          </div>
        </div>

        {loading ? (
          <div className="mb-8">
            <Skeleton className="h-32 max-w-xs" />
          </div>
        ) : (
          <div className="mb-8">
            <StatCard
              title="Favorite Books"
              value={books.length}
              icon={Heart}
              className="max-w-xs"
            />
          </div>
        )}

        <div className="flex justify-end mb-8">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-added">Date Added</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : sortedBooks.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No favorite books yet</h3>
            <p className="text-muted-foreground mb-6">
              Mark books as favorites to see them here
            </p>
            <Button onClick={() => navigate('/my-books')}>Browse Your Books</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {sortedBooks.map((book) => (
              <div key={book.id} className="group">
                <BookCard
                  book={book}
                  onFavoriteToggle={() => handleUnfavorite(book.id)}
                  onViewDetails={() => {}}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
