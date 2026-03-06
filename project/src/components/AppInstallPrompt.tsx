import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/contexts/PWAContext';

export const AppInstallPrompt: React.FC = () => {
    const { deferredPrompt, isInstalled, isIOS, promptInstall, clearPrompt } = usePWA();
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        if (isInstalled || !deferredPrompt || isIOS) {
            setShowPrompt(false);
            return;
        }

        // Check if user previously dismissed the prompt
        const hasDismissed = localStorage.getItem('dealio_install_dismissed');
        if (hasDismissed === 'true') {
            return;
        }

        // Wait a bit before showing the prompt to not overwhelm the user
        const timer = setTimeout(() => {
            setShowPrompt(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, [isInstalled, deferredPrompt, isIOS]);

    const handleInstallClick = async () => {
        try {
            await promptInstall();
            setShowPrompt(false);
        } catch (error) {
            console.error('Error in AppInstallPrompt:', error);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('dealio_install_dismissed', 'true');
        clearPrompt();
    };

    // Only render if we have a prompt and it's not already installed and not iOS (iOS has its own instructions in InstallButton)
    if (!showPrompt || isInstalled || !deferredPrompt || isIOS) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom flex justify-center">
            <Card className="w-full max-w-sm bg-background/95 backdrop-blur-md shadow-xl border-primary/20 p-4 relative overflow-hidden">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full text-muted-foreground hover:bg-muted"
                    onClick={handleDismiss}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-4 mt-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c8a2c9] to-[#9a7a9b] flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-white font-bold text-xl">D</span>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-sm">Installer Dealio</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                            Ajoutez l'application à votre écran d'accueil pour un accès plus rapide.
                        </p>
                    </div>
                </div>

                <Button
                    className="w-full mt-4 font-semibold shadow-md active:scale-[0.98] transition-all"
                    onClick={handleInstallClick}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Installer maintenant
                </Button>
            </Card>
        </div>
    );
};
