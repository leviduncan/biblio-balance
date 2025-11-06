import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { BookCard } from '@/components/BookCard';
import { bookService } from '@/services/bookService';
import { Book } from '@/types/book';
import { useToast } from '@/hooks/use-toast';

const CurrentlyReading = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, [user]);

  const loadBooks = async () => {
    if (!user) return;
    try {
      const data = await bookService.getByStatus(user.id, 'currently-reading');
      setBooks(data);
    } catch (error) {
      toast({ title: 'Error loading books', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (id: string, isFavorite: boolean) => {
    try {
      await bookService.toggleFavorite(id, isFavorite);
      await loadBooks();
      toast({ title: isFavorite ? 'Added to favorites' : 'Removed from favorites' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  if (loading) {
    return <Layout><div className="text-center py-12">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Currently Reading</h1>
        {books.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg">
            <p className="text-muted-foreground">No books currently reading</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {books.map((book) => (
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
    </Layout>
  );
};

export default CurrentlyReading;
