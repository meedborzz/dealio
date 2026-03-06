import React, { useState, useMemo } from 'react';
import { Shield, CreditCard, Zap, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../hooks/usePreferences';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingPage: React.FC = () => {
  const { updatePreferences } = usePreferences();
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const screens = useMemo(() => [
    {
      icon: Shield,
      title: "Dealio est toujours gratuit",
      text: "Pour vous et pour les salons. Pas d'abonnement, pas de frais caches.",
      color: "from-[#c8a2c9] to-[#9a7a9b]",
      bgColor: "bg-purple-500/5",
      accent: "#c8a2c9"
    },
    {
      icon: CreditCard,
      title: "Aucun paiement dans l'app",
      text: "Vous reservez en 30 secondes, puis vous payez directement au salon.",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-500/5",
      accent: "#60a5fa"
    },
    {
      icon: Zap,
      title: "Des offres limitees, reservation simple",
      text: "Plus de reduction = plus de places. Les offres disparaissent quand c'est complet.",
      color: "from-amber-400 to-amber-600",
      bgColor: "bg-amber-500/5",
      accent: "#fbbf24"
    }
  ], []);

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    updatePreferences({ setupCompleted: true });
    navigate('/');
  };

  const currentData = screens[currentScreen];
  const Icon = currentData.icon;

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden relative font-sans select-none">
      {/* Dynamic Background Elements - Optimized with transformZ/will-change and reduced blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none translate-z-0">
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-15 bg-gradient-to-br ${currentData.color} will-change-transform`}
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 bg-gradient-to-tr ${currentData.color} will-change-transform`}
        />
      </div>

      {/* Skip Button */}
      <div className="absolute top-0 right-0 p-6 z-20">
        <button
          onClick={handleComplete}
          className="text-muted-foreground/60 hover:text-foreground font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-muted/50 active:scale-95"
        >
          Passer
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            {/* Icon Container with Glassmorphism - Optimized animation */}
            <div className="relative mb-12 group">
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-36 h-36 rounded-[2.5rem] bg-gradient-to-br ${currentData.color} flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative z-10 border border-white/20 will-change-transform`}
              >
                <Icon className="h-16 w-16 text-white" strokeWidth={1.5} />
              </motion.div>

              {/* Decorative rings - Simpler animation than pulse for performance */}
              <motion.div
                animate={{
                  scale: [0.95, 1.05, 0.95],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -inset-4 rounded-[3rem] border border-current/10 ${currentData.bgColor} z-0`}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-4 max-w-sm"
            >
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                {currentData.title}
              </h1>
              <p className="text-lg text-muted-foreground/80 leading-relaxed px-4">
                {currentData.text}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="px-8 pb-12 pt-6 relative z-10 w-full max-w-md mx-auto">
        {/* Indicators */}
        <div className="flex justify-center items-center gap-3 mb-10">
          {screens.map((_, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{
                width: index === currentScreen ? 32 : 8,
                backgroundColor: index === currentScreen ? currentData.accent : "rgba(100, 100, 100, 0.1)"
              }}
              className="h-2 rounded-full transition-colors duration-300"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full h-16 rounded-[2rem] bg-foreground text-background font-bold text-xl shadow-2xl flex items-center justify-center gap-3 group overflow-hidden relative active:ring-4 active:ring-primary/20"
        >
          <span className="relative z-10">
            {currentScreen < screens.length - 1 ? 'Suivant' : 'Commencer'}
          </span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="relative z-10"
          >
            {currentScreen < screens.length - 1 ? <ArrowRight className="h-6 w-6" /> : <Check className="h-6 w-6" />}
          </motion.div>

          {/* Button Shine effect - CSS based transform is smoother */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
        </motion.button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .translate-z-0 {
          transform: translateZ(0);
        }
        .will-change-transform {
          will-change: transform;
        }
      `}} />
    </div>
  );
};

export default OnboardingPage;
