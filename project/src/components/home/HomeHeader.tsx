import React from 'react';
import { MapPin, Bell, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HomeHeaderProps {
  userName?: string;
  userAvatar?: string;
  location?: string;
  unreadCount?: number;
  isGuest?: boolean;
  onLocationClick: () => void;
  onNotificationClick: () => void;
  onProfileClick: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  userAvatar,
  location = 'Set location',
  unreadCount = 0,
  isGuest = false,
  onLocationClick,
  onNotificationClick,
  onProfileClick,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="glass-header px-4 py-4 relative z-40">
      <div className="safe-area-top" />
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onLocationClick}
          className="rounded-full gap-2 bg-background relative z-10"
        >
          <MapPin className="h-4 w-4" />
          <span className="font-medium">{location}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationClick}
            className="relative rounded-full"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white ring-2 ring-background shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {isGuest ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onProfileClick}
              className="rounded-full"
            >
              <User className="h-5 w-5" />
            </Button>
          ) : (
            <Avatar className="h-8 w-8 cursor-pointer" onClick={onProfileClick}>
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {userName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find the best deals on beauty services
        </p>
      </div>
    </div>
  );
};
