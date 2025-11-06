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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-12 text-center shadow-warm">
      <div className="relative z-10">
        <h1 className="text-5xl font-bold text-white mb-4">{title}</h1>
        {subtitle && <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{subtitle}</p>}
        {(ctaText || secondaryCtaText) && (
          <div className="flex gap-4 justify-center">
            {ctaText && ctaLink && (
              <Link to={ctaLink}>
                <Button size="lg" variant="secondary" className="shadow-lg">
                  {ctaText}
                </Button>
              </Link>
            )}
            {secondaryCtaText && secondaryCtaLink && (
              <Link to={secondaryCtaLink}>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  {secondaryCtaText}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
      </div>
    </div>
  );
}
