import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tag, TrendingUp, Clock } from 'lucide-react';

const BusinessIntroPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-6 shadow-lg">
            <Tag className="h-10 w-10 text-primary-foreground" />
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            Dealio vous envoie des clients
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Plus vous faites de réduction, plus vous obtenez de réservations.
            <br />
            Votre offre disparaît automatiquement quand les places sont épuisées.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Simple</h3>
            <p className="text-sm text-muted-foreground">
              Créez une offre en 2 minutes
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Automatique</h3>
            <p className="text-sm text-muted-foreground">
              Les clients réservent directement
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Rapide</h3>
            <p className="text-sm text-muted-foreground">
              7 jours maximum par offre
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate('/business/offers/create')}
            className="px-8 py-6 text-lg h-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-xl"
          >
            Créer ma première offre
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntroPage;
