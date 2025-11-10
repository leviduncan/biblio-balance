import { Book } from '@/types/book';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Eye } from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import { ProgressBar } from '@/components/ProgressBar';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BookCardProps {
  book: Book;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  onViewDetails?: (id: string) => void;
  showProgress?: boolean;
  extraContent?: ReactNode;
  className?: string;
}

export function BookCard({
  book,
  onFavoriteToggle,
  onViewDetails,
  showProgress = true,
  extraContent,
  className,
}: BookCardProps) {
  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300 hover:shadow-lift hover:-translate-y-1',
      'border-2 border-transparent hover:border-primary/20',
      'animate-fade-in',
      className
    )}>
      <div className="flex flex-col p-4">
        {/* Book Cover */}
        <div className="w-full mb-4">
          <div className="relative w-full aspect-[2/3] max-w-48 mx-auto rounded-md overflow-hidden bg-muted transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-amber-glow animate-gradient-shift bg-[length:200%_200%]">
                <span className="text-4xl font-bold text-white transform transition-transform duration-300 group-hover:scale-110">
                  {book.title.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{book.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{book.author}</p>
              {book.genre && (
                <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full transition-all duration-300 hover:bg-primary/20 hover:scale-105 cursor-default">
                  {book.genre}
                </span>
              )}
            </div>

            <div className="flex gap-1">
              {onFavoriteToggle && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onFavoriteToggle(book.id, !book.isFavorite)}
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Heart
                    className={cn(
                      'h-4 w-4 transition-all duration-300',
                      book.isFavorite && 'fill-destructive text-destructive animate-bounce-in'
                    )}
                  />
                </Button>
              )}
              {onViewDetails && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onViewDetails(book.id)}
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                </Button>
              )}
            </div>
          </div>

          {/* Rating */}
          {book.rating && (
            <div className="mt-2">
              <StarRating rating={book.rating} size="sm" />
            </div>
          )}

          {/* Progress */}
          {showProgress && book.status === 'currently-reading' && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {book.currentPage} / {book.pageCount} pages
                </span>
              </div>
              <ProgressBar value={book.currentPage} max={book.pageCount} showPercentage={false} />
            </div>
          )}

          {/* Extra Content */}
          {extraContent && <div className="mt-3">{extraContent}</div>}
        </div>
      </div>
    </Card>
  );
}
