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
            star <= rating 
              ? 'fill-primary text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]' 
              : 'text-muted-foreground',
            interactive && 'cursor-pointer transition-all duration-200 hover:scale-125 hover:-rotate-12 active:scale-90',
            interactive && star <= rating && 'animate-bounce-in'
          )}
          onClick={() => handleClick(star)}
          onMouseEnter={() => interactive && onChange && onChange(star)}
        />
      ))}
    </div>
  );
}
