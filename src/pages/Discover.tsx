import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { openLibraryService } from '@/services/openLibraryService';
import { bookService } from '@/services/bookService';
import { OpenLibraryBook } from '@/types/book';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Discover Books</h1>

        <div className="flex gap-2">
          <Input
            placeholder="Search for books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}><Search className="h-4 w-4" /></Button>
        </div>

        {selectedBooks.size > 0 && (
          <Button onClick={handleAddSelected}>
            Add {selectedBooks.size} Selected Books
          </Button>
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-2">
            {books.slice(0, 50).map((book) => (
              <div key={book.key} className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <Checkbox
                  checked={selectedBooks.has(book.key)}
                  onCheckedChange={(checked) => {
                    const newSet = new Set(selectedBooks);
                    checked ? newSet.add(book.key) : newSet.delete(book.key);
                    setSelectedBooks(newSet);
                  }}
                />
                <div className="flex-1">
                  <p className="font-semibold">{book.title}</p>
                  <p className="text-sm text-muted-foreground">{book.author_name?.[0] || 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Discover;
