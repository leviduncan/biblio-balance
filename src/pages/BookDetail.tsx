import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { bookService } from '@/services/bookService';
import { Book } from '@/types/book';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/StarRating';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Heart, Trash2, Edit, BookOpen } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<Book['status']>('want-to-read');

  useEffect(() => {
    loadBook();
  }, [id, user]);

  const loadBook = async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      const bookData = await bookService.getById(id);
      
      if (!bookData) {
        toast({
          title: 'Book not found',
          description: 'This book does not exist or you do not have access to it.',
          variant: 'destructive',
        });
        navigate('/my-books');
        return;
      }
      
      setBook(bookData);
      setCurrentPage(bookData.currentPage);
      setRating(bookData.rating || 0);
      setStatus(bookData.status);
    } catch (error) {
      console.error('Error loading book:', error);
      toast({
        title: 'Error',
        description: 'Failed to load book details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!book) return;

    try {
      await bookService.updateProgress(book.id, currentPage, book.pageCount);
      await loadBook();
      setProgressDialogOpen(false);
      toast({
        title: 'Progress updated',
        description: `Current page: ${currentPage} of ${book.pageCount}`,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRating = async (newRating: number) => {
    if (!book) return;

    try {
      await bookService.update(book.id, { rating: newRating });
      setRating(newRating);
      setBook({ ...book, rating: newRating });
      toast({
        title: 'Rating updated',
        description: `Set to ${newRating} stars`,
      });
    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rating.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (newStatus: Book['status']) => {
    if (!book) return;

    try {
      await bookService.update(book.id, { status: newStatus });
      setStatus(newStatus);
      setBook({ ...book, status: newStatus });
      toast({
        title: 'Status updated',
        description: `Changed to ${newStatus.replace('-', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!book) return;

    try {
      await bookService.toggleFavorite(book.id, !book.isFavorite);
      setBook({ ...book, isFavorite: !book.isFavorite });
      toast({
        title: book.isFavorite ? 'Removed from favorites' : 'Added to favorites',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!book) return;

    try {
      await bookService.delete(book.id);
      toast({
        title: 'Book deleted',
        description: 'The book has been removed from your library.',
      });
      navigate('/my-books');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete book.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Book Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This book does not exist or you do not have access to it.
          </p>
          <Button onClick={() => navigate('/my-books')}>
            Back to Library
          </Button>
        </div>
      </Layout>
    );
  }

  const progressPercentage = book.pageCount > 0 ? (book.currentPage / book.pageCount) * 100 : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Cover Image */}
          <div className="md:col-span-1">
            <div className="relative group">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-6xl font-bold text-primary/40">
                    {book.title[0]}
                  </span>
                </div>
              )}
              
              <Button
                variant={book.isFavorite ? 'default' : 'outline'}
                size="icon"
                className="absolute top-4 right-4"
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-5 w-5 ${book.isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {book.status === 'currently-reading' && (
                <Button
                  onClick={() => setProgressDialogOpen(true)}
                  className="w-full gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Update Progress
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete Book
              </Button>
            </div>
          </div>

          {/* Right Column - Book Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {book.genre && <Badge variant="secondary">{book.genre}</Badge>}
                <Badge variant="outline">{book.pageCount} pages</Badge>
                <Badge 
                  variant={
                    book.status === 'completed' ? 'default' : 
                    book.status === 'currently-reading' ? 'secondary' : 
                    'outline'
                  }
                >
                  {book.status.replace('-', ' ')}
                </Badge>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground mb-2 block">Your Rating</Label>
                <StarRating
                  rating={rating}
                  onChange={handleUpdateRating}
                  interactive={true}
                  size="lg"
                />
              </div>

              {/* Status Selector */}
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground mb-2 block">Reading Status</Label>
                <Select value={status} onValueChange={(value: Book['status']) => handleUpdateStatus(value)}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="want-to-read">Want to Read</SelectItem>
                    <SelectItem value="currently-reading">Currently Reading</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reading Progress */}
              {book.status === 'currently-reading' && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-muted-foreground">Reading Progress</Label>
                    <span className="text-sm font-medium">
                      {book.currentPage} / {book.pageCount} pages ({Math.round(progressPercentage)}%)
                    </span>
                  </div>
                  <Progress value={progressPercentage} max={100} className="h-3" />
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                {book.startedReading && (
                  <div>
                    <p className="text-muted-foreground">Started Reading</p>
                    <p className="font-medium">
                      {new Date(book.startedReading).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {book.finishedReading && (
                  <div>
                    <p className="text-muted-foreground">Finished Reading</p>
                    <p className="font-medium">
                      {new Date(book.finishedReading).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Progress Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Reading Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="current-page">Current Page</Label>
              <Input
                id="current-page"
                type="number"
                min="0"
                max={book.pageCount}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Total: {book.pageCount} pages
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.floor(book.pageCount * 0.25))}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.floor(book.pageCount * 0.5))}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.floor(book.pageCount * 0.75))}
              >
                75%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(book.pageCount)}
              >
                100%
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProgress}>
              Save Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{book.title}" from your library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
