import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ value, max = 100, className, showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-amber-glow transition-all duration-500 ease-spring rounded-full relative overflow-hidden animate-gradient-shift bg-[length:200%_200%]"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer" />
        </div>
        {percentage > 0 && (
          <div 
            className="absolute top-0 h-full w-1 bg-white/60 rounded-full animate-pulse-glow"
            style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          />
        )}
      </div>
      {showPercentage && (
        <p className="text-xs text-muted-foreground text-right transition-all duration-200 hover:text-primary">
          {percentage.toFixed(0)}%
        </p>
      )}
    </div>
  );
}
