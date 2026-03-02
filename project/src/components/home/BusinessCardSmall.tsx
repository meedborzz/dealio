import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Business {
  id: string;
  name: string;
  image_url?: string;
  category?: string;
  city?: string;
  is_open?: boolean;
}

interface BusinessCardSmallProps {
  business: Business;
  distance?: number;
}

export const BusinessCardSmall: React.FC<BusinessCardSmallProps> = ({ business, distance }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/business/${business.id}`);
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-md border-border bg-card"
      onClick={handleClick}
    >
      <CardContent className="p-3 flex gap-3">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {business.image_url ? (
            <img
              src={business.image_url}
              alt={business.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1">{business.name}</h3>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {business.category && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {business.category}
              </Badge>
            )}
            {business.is_open && (
              <Badge variant="outline" className="text-xs px-2 py-0 border-accent text-accent">
                Open
              </Badge>
            )}
          </div>

          {distance && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
              <MapPin className="h-3 w-3" />
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
