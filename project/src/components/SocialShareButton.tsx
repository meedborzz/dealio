import React, { useState } from 'react';
import { Share2, MessageCircle, Send, Camera, Link, Mail } from 'lucide-react';
import { Deal } from '../types';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface SocialShareButtonProps {
  deal: Deal;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  deal,
  size = 'md',
  variant = 'icon'
}) => {
  const [open, setOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  const platforms = [
    {
      id: 'whatsapp' as const,
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#1DA851]',
      textColor: 'text-white'
    },
    {
      id: 'messenger' as const,
      name: 'Messenger',
      icon: Send,
      color: 'bg-[#0084FF] hover:bg-[#0073E6]',
      textColor: 'text-white'
    },
    {
      id: 'instagram' as const,
      name: 'Instagram',
      icon: Camera,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      textColor: 'text-white'
    },
    {
      id: 'email' as const,
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-white'
    },
    {
      id: 'link' as const,
      name: 'Copier le lien',
      icon: Link,
      color: 'bg-muted hover:bg-accent',
      textColor: 'text-foreground'
    }
  ];

  const handleShare = async (platform: typeof platforms[0]['id']) => {
    setSharing(true);
    try {
      const dealUrl = `${window.location.origin}/deal/${deal.id}`;
      const shareText = `${deal.title} - ${deal.discounted_price} DH (${deal.discount_percentage}% de réduction) chez ${deal.business?.name || 'Dealio'}`;

      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + dealUrl)}`, '_blank');
          break;
        case 'messenger':
          window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(dealUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(dealUrl)}`, '_blank');
          break;
        case 'instagram':
          if (navigator.share) {
            await navigator.share({ title: deal.title, text: shareText, url: dealUrl });
          }
          break;
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(deal.title)}&body=${encodeURIComponent(shareText + '\n\n' + dealUrl)}`;
          break;
        case 'link':
          await navigator.clipboard.writeText(dealUrl);
          alert('Lien copié dans le presse-papiers !');
          break;
      }
      setOpen(false);
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setSharing(false);
    }
  };


  if (variant === 'icon') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={sharing}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager cette offre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-1">{deal.title}</h4>
              <p className="text-sm text-muted-foreground">{deal.business?.name || 'Dealio'}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-lg font-bold text-primary">{deal.discounted_price} DH</span>
                <span className="text-sm text-muted-foreground line-through">{deal.original_price} DH</span>
                <span className="text-sm font-bold text-red-600">-{deal.discount_percentage}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.id}
                    onClick={() => handleShare(platform.id)}
                    disabled={sharing}
                    className={`${platform.color} ${platform.textColor} flex items-center justify-center space-x-2 p-4 h-auto`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{platform.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={sharing}
          className="relative overflow-hidden bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a882a9] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 px-8 py-6 rounded-2xl font-semibold text-base"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Partager cette offre
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Partager cette offre</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl p-4 border border-border/50">
            <h4 className="font-semibold text-foreground mb-1 text-base">{deal.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{deal.business?.name || 'Dealio'}</p>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] bg-clip-text text-transparent">
                {deal.discounted_price} DH
              </span>
              <span className="text-sm text-muted-foreground line-through">{deal.original_price} DH</span>
              <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                -{deal.discount_percentage}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  disabled={sharing}
                  className={`${platform.color} ${platform.textColor} flex items-center justify-center space-x-2 p-5 h-auto rounded-xl transition-transform hover:scale-105 active:scale-95`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{platform.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareButton;