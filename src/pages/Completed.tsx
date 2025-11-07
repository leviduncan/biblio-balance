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
import { CheckCircle2, BookOpen, Star, TrendingUp, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function Completed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('finish-date');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    loadBooks();
  }, [user]);

  useEffect(() => {
    filterAndSortBooks();
  }, [books, searchQuery, sortBy, selectedYear]);

  const loadBooks = async () => {
    if (!user) return;
    try {
      const data = await bookService.getByStatus(user.id, 'completed');
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

    if (selectedYear !== 'all') {
      result = result.filter((book) => {
        if (!book.finishedReading) return false;
        return new Date(book.finishedReading).getFullYear().toString() === selectedYear;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'finish-date':
        default:
          return (
            new Date(b.finishedReading || 0).getTime() -
            new Date(a.finishedReading || 0).getTime()
          );
      }
    });

    setFilteredBooks(result);
  };

  const totalPages = books.reduce((sum, book) => sum + (book.pageCount || 0), 0);
  const averageRating =
    books.filter((b) => b.rating).reduce((sum, book) => sum + (book.rating || 0), 0) /
      books.filter((b) => b.rating).length || 0;
  const currentYear = new Date().getFullYear();
  const booksThisYear = books.filter((book) => {
    if (!book.finishedReading) return false;
    return new Date(book.finishedReading).getFullYear() === currentYear;
  }).length;

  const years = Array.from(
    new Set(
      books
        .map((b) => b.finishedReading && new Date(b.finishedReading).getFullYear())
        .filter(Boolean)
    )
  ).sort((a, b) => (b as number) - (a as number));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-amber-glow bg-clip-text text-transparent">
            Completed Books
          </h1>
          <p className="text-muted-foreground">Books you've finished reading</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Completed"
              value={books.length}
              icon={CheckCircle2}
            />
            <StatCard
              title="Pages Read"
              value={totalPages.toLocaleString()}
              icon={BookOpen}
            />
            <StatCard
              title="Average Rating"
              value={averageRating.toFixed(1)}
              icon={Star}
            />
            <StatCard
              title="This Year"
              value={booksThisYear}
              icon={TrendingUp}
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
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year!.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="finish-date">Finish Date</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="title">Title</SelectItem>
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
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No completed books</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try a different search' : 'Start reading to see completed books here'}
            </p>
            <Button onClick={() => navigate('/currently-reading')}>View Current Books</Button>
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
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
