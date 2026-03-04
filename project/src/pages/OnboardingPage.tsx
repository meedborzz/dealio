import React, { useState, useRef, useCallback } from 'react';
import { Shield, CreditCard, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../hooks/usePreferences';

const OnboardingPage: React.FC = () => {
  const { updatePreferences } = usePreferences();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const screens = [
    {
      icon: Shield,
      title: "Dealio est toujours gratuit",
      text: "Pour vous et pour les salons. Pas d'abonnement, pas de frais caches.",
    },
    {
      icon: CreditCard,
      title: "Aucun paiement dans l'app",
      text: "Vous reservez en 30 secondes, puis vous payez directement au salon.",
    },
    {
      icon: Zap,
      title: "Des offres limitees, reservation simple",
      text: "Plus de reduction = plus de places. Les offres disparaissent quand c'est complet.",
    }
  ];

  const currentScreenData = screens[currentScreen];
  const IconComponent = currentScreenData.icon;

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentScreen < screens.length - 1) {
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentScreen(prev => prev + 1);
        setSlideDirection(null);
      }, 150);
    } else if (isRightSwipe && currentScreen > 0) {
      setSlideDirection('right');
      setTimeout(() => {
        setCurrentScreen(prev => prev - 1);
        setSlideDirection(null);
      }, 150);
    }
  }, [touchStart, touchEnd, currentScreen, screens.length]);

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentScreen(currentScreen + 1);
        setSlideDirection(null);
      }, 150);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    updatePreferences({ setupCompleted: true });
    navigate('/');
  };

  return (
    <div
      ref={containerRef}
      className="h-dvh bg-gradient-to-br from-background via-background to-muted flex flex-col overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={`flex-1 flex flex-col items-center justify-center px-6 transition-all duration-200 ease-out ${slideDirection === 'left' ? '-translate-x-8 opacity-0' :
        slideDirection === 'right' ? 'translate-x-8 opacity-0' : 'translate-x-0 opacity-100'
        }`}>
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#c8a2c9] to-[#b892b9] flex items-center justify-center mb-8 shadow-2xl">
          <IconComponent className="h-12 w-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-center text-foreground mb-4 max-w-md">
          {currentScreenData.title}
        </h1>

        <p className="text-lg text-center text-muted-foreground mb-12 max-w-md leading-relaxed">
          {currentScreenData.text}
        </p>

        <div className="flex justify-center space-x-2 mb-12 mt-8">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentScreen
                ? 'bg-[#c8a2c9] w-8'
                : 'bg-muted-foreground/30 w-2'
                }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 pb-8 space-y-3 flex-shrink-0">
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a882a9] text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          {currentScreen < screens.length - 1 ? 'Suivant' : 'Commencer'}
        </button>

        {currentScreen < screens.length - 1 && (
          <button
            onClick={handleComplete}
            className="w-full text-muted-foreground hover:text-foreground py-3 font-medium transition-colors"
          >
            Passer
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
