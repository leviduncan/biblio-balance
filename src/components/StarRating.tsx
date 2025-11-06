import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleClick = (newRating: number) => {
    if (interactive && onChange) {
      onChange(newRating);
    }
  };

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground',
            interactive && 'cursor-pointer hover:scale-110 transition-transform'
          )}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
}
