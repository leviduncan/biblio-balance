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
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-hero transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-muted-foreground text-right">
          {percentage.toFixed(0)}%
        </p>
      )}
    </div>
  );
}
