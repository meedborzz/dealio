import { useState } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { usePWA } from '../contexts/PWAContext';

export function InstallButton() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWA();
  const [showDialog, setShowDialog] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowDialog(true);
      return;
    }

    try {
      await promptInstall();
    } catch (error) {
      console.error('Error installing PWA:', error);
      setShowDialog(true);
    }
  };

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleInstallClick}
        size="lg"
        className="w-full h-12 bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a882a9] text-white font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all rounded-xl"
      >
        <Download className="h-4 w-4 mr-2" />
        Installer l'application
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-primary" />
              Installer l'application
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4 text-foreground">
              {isIOS ? (
                <>
                  <p className="text-sm">
                    Pour installer sur iOS :
                  </p>
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-4 rounded-xl space-y-2.5 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">1</span>
                      </div>
                      <p className="flex-1 text-foreground/90">
                        Appuyez sur <Share className="w-3.5 h-3.5 inline mx-1" /> en bas de Safari
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">2</span>
                      </div>
                      <p className="flex-1 text-foreground/90">
                        Sélectionnez "Sur l'écran d'accueil"
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">3</span>
                      </div>
                      <p className="flex-1 text-foreground/90">
                        Appuyez sur "Ajouter"
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    Pour installer l'application :
                  </p>
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-4 rounded-xl space-y-2.5 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">1</span>
                      </div>
                      <p className="flex-1 text-foreground/90">
                        Ouvrez le menu de votre navigateur (⋮)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">2</span>
                      </div>
                      <p className="flex-1 text-foreground/90">
                        Sélectionnez "Installer l'application"
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">3</span>
                      </div>
                      <p className="flex-1 text-foreground/90">
                        Confirmez l'installation
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Expérience rapide et fluide avec notifications
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowDialog(false)}
            className="w-full bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a882a9] rounded-xl font-semibold"
          >
            Compris
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
