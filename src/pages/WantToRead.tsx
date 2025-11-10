import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { BookCard } from '@/components/BookCard';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { bookService } from '@/services/bookService';
import { useAuth } from '@/contexts/AuthContext';
import { Book } from '@/types/book';
import { BookOpen, Search, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function WantToRead() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-added');

  useEffect(() => {
    loadBooks();
  }, [user]);

  useEffect(() => {
    filterAndSortBooks();
  }, [books, searchQuery, sortBy]);

  const loadBooks = async () => {
    if (!user) return;
    try {
      const data = await bookService.getByStatus(user.id, 'want-to-read');
      setBooks(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load books',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBooks = () => {
    let result = [...books];

    if (searchQuery) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'date-added':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    setFilteredBooks(result);
  };

  const handleStartReading = async (bookId: string) => {
    try {
      await bookService.update(bookId, { status: 'currently-reading' });
      toast({
        title: 'Started reading',
        description: 'Book moved to Currently Reading',
      });
      loadBooks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update book status',
        variant: 'destructive',
      });
    }
  };

  const genres = Array.from(new Set(books.map((b) => b.genre).filter(Boolean)));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-amber-glow bg-clip-text text-transparent">
            Your Reading List
          </h1>
          <p className="text-muted-foreground">Books you want to read</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Books"
              value={books.length}
              icon={BookOpen}
            />
            <StatCard
              title="Genres"
              value={genres.length}
              icon={BookOpen}
            />
            <StatCard
              title="Most Common"
              value={genres[0] || 'None'}
              icon={BookOpen}
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-added">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No books in your reading list</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try a different search' : 'Discover new books to add to your list'}
            </p>
            <Button onClick={() => navigate('/discover')}>Discover Books</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onFavoriteToggle={async (id, isFavorite) => {
                  await bookService.toggleFavorite(id, isFavorite);
                  loadBooks();
                }}
                onViewDetails={() => {}}
                extraContent={
                  <Button
                    size="sm"
                    className="w-full mt-2 whitespace-nowrap"
                    onClick={() => handleStartReading(book.id)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Start Reading
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
