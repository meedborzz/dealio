import { useState } from 'react';
import { SpecialDate } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, X, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface SpecialDatesManagerProps {
  specialDates: Record<string, SpecialDate>;
  onChange: (dates: Record<string, SpecialDate>) => void;
}

export default function SpecialDatesManager({ specialDates, onChange }: SpecialDatesManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newDateClosed, setNewDateClosed] = useState(true);
  const [newDateReason, setNewDateReason] = useState('');
  const [newDateOpen, setNewDateOpen] = useState('09:00');
  const [newDateClose, setNewDateClose] = useState('18:00');

  const sortedDates = Object.entries(specialDates).sort(([dateA], [dateB]) =>
    dateA.localeCompare(dateB)
  );

  const handleAddDate = () => {
    if (!newDate) return;

    const updatedDates = {
      ...specialDates,
      [newDate]: {
        closed: newDateClosed,
        reason: newDateReason || undefined,
        open: !newDateClosed ? newDateOpen : undefined,
        close: !newDateClosed ? newDateClose : undefined,
      },
    };

    onChange(updatedDates);
    setShowAddForm(false);
    setNewDate('');
    setNewDateClosed(true);
    setNewDateReason('');
    setNewDateOpen('09:00');
    setNewDateClose('18:00');
  };

  const handleRemoveDate = (date: string) => {
    const updatedDates = { ...specialDates };
    delete updatedDates[date];
    onChange(updatedDates);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Dates spéciales</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {showAddForm && (
          <Card className="p-4 border-2 border-dashed">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newDateClosed}
                    onChange={() => setNewDateClosed(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Fermé</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!newDateClosed}
                    onChange={() => setNewDateClosed(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Horaires spéciaux</span>
                </label>
              </div>

              {!newDateClosed && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={newDateOpen}
                    onChange={(e) => setNewDateOpen(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-gray-500">à</span>
                  <Input
                    type="time"
                    value={newDateClose}
                    onChange={(e) => setNewDateClose(e.target.value)}
                    className="flex-1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Raison (optionnel)</label>
                <Input
                  type="text"
                  value={newDateReason}
                  onChange={(e) => setNewDateReason(e.target.value)}
                  placeholder="Ex: Jour férié, Événement spécial..."
                />
              </div>

              <Button
                type="button"
                onClick={handleAddDate}
                disabled={!newDate}
                className="w-full"
              >
                Enregistrer la date
              </Button>
            </div>
          </Card>
        )}

        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune date spéciale configurée</p>
            <p className="text-xs mt-1">Ajoutez des jours fériés ou des horaires spéciaux</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedDates.map(([date, details]) => (
              <div
                key={date}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {format(new Date(date + 'T00:00:00'), 'EEEE d MMMM yyyy')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {details.closed ? (
                      <span className="text-red-600">Fermé</span>
                    ) : (
                      <span className="text-green-600">
                        Ouvert {details.open} - {details.close}
                      </span>
                    )}
                    {details.reason && <span className="ml-2">• {details.reason}</span>}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveDate(date)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
        <p className="font-medium mb-1">Comment utiliser les dates spéciales</p>
        <p className="text-blue-700">
          Configurez les jours où vous êtes fermé (jours fériés) ou avec des horaires différents
          de votre calendrier habituel.
        </p>
      </div>
    </Card>
  );
}
