import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn(
      'group p-6 shadow-card transition-all duration-300 hover:shadow-glow hover:-translate-y-1',
      'animate-fade-in border-2 border-transparent hover:border-primary/20',
      'overflow-hidden relative',
      className
    )}>
      <div className="absolute inset-0 bg-gradient-amber-glow opacity-0 group-hover:opacity-5 transition-opacity duration-500 animate-gradient-shift bg-[length:200%_200%]" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-primary/80">
            {title}
          </p>
          <p className="text-3xl font-bold mt-2 bg-gradient-amber-glow bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%] transition-all duration-300 group-hover:scale-105">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1 transition-opacity duration-200 group-hover:opacity-80">
              {trend}
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-6">
          <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>
    </Card>
  );
}
