import React, { useRef, useState } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/types';
import { useNavigate } from 'react-router-dom';

interface OfferHeroCarouselProps {
  deals: Deal[];
  onBook?: (deal: Deal) => void;
}

export const OfferHeroCarousel: React.FC<OfferHeroCarouselProps> = ({ deals, onBook }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  const handleBookClick = (e: React.MouseEvent, deal: Deal) => {
    e.stopPropagation();
    if (onBook) {
      onBook(deal);
    } else {
      navigate(`/deal/${deal.id}`);
    }
  };

  if (deals.length === 0) return null;

  return (
    <div className="space-y-3 -mx-4 px-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {deals.map((deal) => {
          const businessName = deal.business?.name || deal.businesses?.name || 'Business';
          const imageUrl = deal.image_url || deal.business?.image_url || deal.businesses?.image_url;

          return (
            <Card
              key={deal.id}
              className="flex-shrink-0 w-[85%] md:w-[45%] lg:w-[30%] snap-start overflow-hidden border-border bg-gradient-to-br from-card to-muted/50 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => navigate(`/deal/${deal.id}`)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={deal.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                    <Badge className="bg-accent text-accent-foreground font-medium px-3 py-1">
                      Today's Special
                    </Badge>

                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">{deal.title}</h3>
                      <p className="text-muted-foreground text-sm">{businessName}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-foreground leading-none">{deal.discounted_price} DH</span>
                          <span className="text-lg text-muted-foreground line-through leading-none">{deal.original_price} DH</span>
                        </div>
                        <Badge className="bg-destructive text-destructive-foreground font-bold mt-1">
                          Save {deal.discount_percentage}%
                        </Badge>
                      </div>
                    </div>

                    {deal.valid_until && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock className="h-4 w-4" />
                        <span>Valid until {new Date(deal.valid_until).toLocaleDateString()}</span>
                      </div>
                    )}

                    <Button
                      onClick={(e) => handleBookClick(e, deal)}
                      size="lg"
                      className="w-full font-semibold"
                    >
                      Book now
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {deals.length > 1 && (
        <div className="flex justify-center gap-2">
          {deals.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/20 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
