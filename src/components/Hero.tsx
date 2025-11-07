import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export function Hero({ title, subtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink }: HeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-amber-glow animate-gradient-shift bg-[length:200%_200%] p-12 text-center shadow-glow">
      <div className="relative z-10">
        <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {subtitle}
          </p>
        )}
        {(ctaText || secondaryCtaText) && (
          <div className="flex gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {ctaText && ctaLink && (
              <Link to={ctaLink}>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                >
                  {ctaText}
                </Button>
              </Link>
            )}
            {secondaryCtaText && secondaryCtaLink && (
              <Link to={secondaryCtaLink}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:border-white/40 active:scale-95 backdrop-blur-sm"
                >
                  {secondaryCtaText}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-pulse-glow"></div>
      </div>
    </div>
  );
}
