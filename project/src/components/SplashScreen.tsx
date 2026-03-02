import React, { useEffect, useState } from 'react';
import Logo from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Smooth animation sequence
    const phase1 = setTimeout(() => setAnimationPhase(1), 100);   // Logo entrance
    const phase2 = setTimeout(() => setAnimationPhase(2), 800);   // Logo settle
    const phase3 = setTimeout(() => setAnimationPhase(3), 1200);  // Text appears
    
    const complete = setTimeout(() => {
      setAnimationPhase(4); // Fade out
      setTimeout(onComplete, 400);
    }, 2200);

    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(phase3);
      clearTimeout(complete);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-background z-50 flex items-center justify-center transition-opacity duration-400 ${
      animationPhase === 4 ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center">
        {/* Logo with smooth animations */}
        <div className={`transition-all duration-700 ease-out ${
          animationPhase === 0 ? 'transform -translate-y-20 scale-75 opacity-0' :
          animationPhase === 1 ? 'transform translate-y-0 scale-100 opacity-100' :
          animationPhase >= 2 ? 'transform translate-y-1 scale-105 opacity-100' : ''
        }`}>
          <div className="mx-auto flex items-center justify-center">
            <Logo className="w-48 h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;