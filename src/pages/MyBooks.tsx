import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookService } from '@/services/bookService';
import { Book } from '@/types/book';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MyBooks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('recently-added');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadBooks();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [allBooks, searchQuery, filterGenre, sortBy, activeTab]);

  const loadBooks = async () => {
    if (!user) return;

    try {
      const data = await bookService.getAll(user.id);
      setAllBooks(data);
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

  const applyFilters = () => {
    let filtered = [...allBooks];

    // Filter by tab (status)
    if (activeTab !== 'all') {
      if (activeTab === 'favorites') {
        filtered = filtered.filter(book => book.isFavorite);
      } else {
        filtered = filtered.filter(book => book.status === activeTab);
      }
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        book =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)
      );
    }

    // Filter by genre
    if (filterGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === filterGenre);
    }

    // Sort
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        filtered.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'progress':
        filtered.sort((a, b) => (b.progressPercentage || 0) - (a.progressPercentage || 0));
        break;
      default: // recently-added
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    setFilteredBooks(filtered);
  };

  const handleFavoriteToggle = async (id: string, isFavorite: boolean) => {
    try {
      await bookService.toggleFavorite(id, isFavorite);
      await loadBooks();
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

  const genres = Array.from(new Set(allBooks.map(book => book.genre).filter(Boolean))) as string[];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your books...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Books</h1>
          <Button onClick={() => navigate('/add-book')}>Add Book</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg shadow-card text-center transition-all duration-300 hover:shadow-glow hover:-translate-y-1 animate-slide-up cursor-default group">
            <p className="text-2xl font-bold bg-gradient-amber-glow bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%] transition-transform duration-300 group-hover:scale-110">
              {allBooks.length}
            </p>
            <p className="text-sm text-muted-foreground">Total Books</p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-card text-center transition-all duration-300 hover:shadow-glow hover:-translate-y-1 animate-slide-up cursor-default group" style={{ animationDelay: '0.05s' }}>
            <p className="text-2xl font-bold bg-gradient-amber-glow bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%] transition-transform duration-300 group-hover:scale-110">
              {allBooks.filter(b => b.status === 'want-to-read').length}
            </p>
            <p className="text-sm text-muted-foreground">Want to Read</p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-card text-center transition-all duration-300 hover:shadow-glow hover:-translate-y-1 animate-slide-up cursor-default group" style={{ animationDelay: '0.1s' }}>
            <p className="text-2xl font-bold bg-gradient-amber-glow bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%] transition-transform duration-300 group-hover:scale-110">
              {allBooks.filter(b => b.status === 'currently-reading').length}
            </p>
            <p className="text-sm text-muted-foreground">Reading</p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-card text-center transition-all duration-300 hover:shadow-glow hover:-translate-y-1 animate-slide-up cursor-default group" style={{ animationDelay: '0.15s' }}>
            <p className="text-2xl font-bold bg-gradient-amber-glow bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%] transition-transform duration-300 group-hover:scale-110">
              {allBooks.filter(b => b.status === 'completed').length}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all duration-200 group-focus-within:text-primary group-focus-within:scale-110" />
            <Input
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 transition-all duration-200 focus:shadow-glow focus:border-primary/50"
            />
          </div>
          <Select value={filterGenre} onValueChange={setFilterGenre}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recently-added">Recently Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="want-to-read">Want to Read</TabsTrigger>
            <TabsTrigger value="currently-reading">Currently Reading</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredBooks.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg">
                <p className="text-muted-foreground mb-4">No books found</p>
                <Button onClick={() => navigate('/discover')}>Discover Books</Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <BookCard
                      book={book}
                      onFavoriteToggle={handleFavoriteToggle}
                      onViewDetails={(id) => navigate(`/book/${id}`)}
                      showProgress
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyBooks;
