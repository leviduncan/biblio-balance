import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { openLibraryService } from '@/services/openLibraryService';
import { bookService } from '@/services/bookService';
import { OpenLibraryBook } from '@/types/book';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Check } from 'lucide-react';

const Discover = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<OpenLibraryBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPopularBooks();
  }, []);

  const loadPopularBooks = async () => {
    setLoading(true);
    const data = await openLibraryService.getPopularBooks();
    setBooks(data);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPopularBooks();
      return;
    }
    setLoading(true);
    const data = await openLibraryService.searchBooks(searchQuery);
    setBooks(data);
    setLoading(false);
  };

  const handleAddSelected = async () => {
    if (!user || selectedBooks.size === 0) return;
    
    try {
      for (const bookKey of selectedBooks) {
        const book = books.find(b => b.key === bookKey);
        if (!book) continue;

        const exists = await bookService.checkIfBookExists(
          user.id,
          book.title,
          book.author_name?.[0] || 'Unknown'
        );

        if (!exists) {
          await bookService.create({
            title: book.title,
            author: book.author_name?.[0] || 'Unknown',
            coverImage: openLibraryService.getCoverUrl(book.cover_i),
            genre: book.subject?.[0],
            pageCount: book.number_of_pages_median || 200,
            status: 'want-to-read',
          }, user.id);
        }
      }

      toast({ title: `Added ${selectedBooks.size} books to your library` });
      setSelectedBooks(new Set());
    } catch (error) {
      toast({ title: 'Error adding books', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-24">
        <h1 className="text-3xl font-bold">Discover Books</h1>

        <div className="flex gap-2">
          <Input
            placeholder="Search for books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="transition-all duration-300 focus:shadow-glow"
          />
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <Skeleton className="aspect-[2/3] w-full rounded-t-lg" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.slice(0, 50).map((book, index) => {
              const isSelected = selectedBooks.has(book.key);
              return (
                <div
                  key={book.key}
                  className="animate-fade-in hover-lift group"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div
                    className={`bg-card rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-primary shadow-glow scale-[0.98]'
                        : 'border-transparent hover:border-primary/50 hover:shadow-lift'
                    }`}
                    onClick={() => {
                      const newSet = new Set(selectedBooks);
                      isSelected ? newSet.delete(book.key) : newSet.add(book.key);
                      setSelectedBooks(newSet);
                    }}
                  >
                    {/* Checkbox overlay */}
                    <div className="absolute top-2 left-2 z-10">
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? 'bg-primary border-primary scale-110'
                            : 'bg-background/80 border-border backdrop-blur-sm'
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                      </div>
                    </div>

                    {/* Book Cover Image */}
                    <div className="aspect-[2/3] relative overflow-hidden bg-gradient-amber-glow">
                      {book.cover_i ? (
                        <img
                          src={openLibraryService.getCoverUrl(book.cover_i, 'M')}
                          alt={book.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div
                        className={`absolute inset-0 flex items-center justify-center ${
                          book.cover_i ? 'hidden' : ''
                        }`}
                      >
                        <span className="text-5xl font-bold text-white drop-shadow-lg">
                          {book.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="p-3 space-y-1">
                      <p className="font-semibold text-sm line-clamp-2 leading-tight">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {book.author_name?.[0] || 'Unknown Author'}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {book.first_publish_year && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            {book.first_publish_year}
                          </Badge>
                        )}
                        {book.subject?.[0] && (
                          <Badge variant="outline" className="text-xs px-2 py-0 truncate max-w-[100px]">
                            {book.subject[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button for Selected Books */}
      {selectedBooks.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <Button
            size="lg"
            onClick={handleAddSelected}
            className="gap-2 shadow-lift hover:shadow-glow transition-all duration-300 px-8"
          >
            <Plus className="h-5 w-5" />
            Add {selectedBooks.size} Selected Book{selectedBooks.size > 1 ? 's' : ''} to Library
            <Check className="h-5 w-5" />
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Discover;
