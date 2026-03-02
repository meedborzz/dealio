import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DealCard from './DealCard';
import { Deal } from '../types';
import { Button } from './ui/button';

interface DealCarouselProps {
  deals: Deal[];
  title: string;
  icon: React.ReactNode;
  variant?: 'default' | 'featured';
  onDealClick?: (deal: Deal) => void;
  calculateDistance?: (deal: Deal) => number | undefined;
  className?: string;
}

const DealCarousel: React.FC<DealCarouselProps> = ({
  deals,
  title,
  icon,
  variant = 'default',
  onDealClick,
  calculateDistance,
  className = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);

      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [deals]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth;
      const scrollAmount = containerWidth * 0.85;

      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (deals.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center shadow-sm">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">{title}</h2>
            <p className="text-xs text-muted-foreground">{deals.length} offre{deals.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-9 w-9 rounded-full bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 shadow-sm border border-gray-200/50 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-9 w-9 rounded-full bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 shadow-sm border border-gray-200/50 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative -mx-4 px-4">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mb-3"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onScroll={updateScrollButtons}
        >
          {deals.map((deal, index) => (
            <div
              key={deal.id}
              className="flex-none w-[280px] sm:w-[300px] snap-start first:pl-0 last:pr-0"
            >
              <div className="transition-transform duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]">
                <DealCard
                  deal={deal}
                  variant={variant}
                  onClick={() => onDealClick?.(deal)}
                  distance={calculateDistance ? calculateDistance(deal) : undefined}
                />
              </div>
            </div>
          ))}
          <div className="flex-none w-8" />
        </div>

        <div className="absolute left-0 top-0 bottom-3 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {deals.length > 1 && (
        <div className="flex justify-center mt-4">
          <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(20, Math.min(100, scrollProgress + 20))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DealCarousel;