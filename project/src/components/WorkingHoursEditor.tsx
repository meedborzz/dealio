import { useState } from 'react';
import { WorkingHours, DayHours } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Clock } from 'lucide-react';

interface WorkingHoursEditorProps {
  workingHours: WorkingHours;
  onChange: (hours: WorkingHours) => void;
}

const DEFAULT_DAY: DayHours = {
  open: '09:00',
  close: '18:00',
  closed: false,
};

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
] as const;

export default function WorkingHoursEditor({ workingHours, onChange }: WorkingHoursEditorProps) {
  const [hours, setHours] = useState<WorkingHours>(workingHours);

  const updateDay = (day: keyof WorkingHours, updates: Partial<DayHours>) => {
    const newHours = {
      ...hours,
      [day]: { ...hours[day], ...updates },
    };
    setHours(newHours);
    onChange(newHours);
  };

  const copyToAll = (day: keyof WorkingHours) => {
    const dayHours = hours[day];
    const newHours = { ...hours };
    DAYS.forEach(({ key }) => {
      newHours[key] = { ...dayHours };
    });
    setHours(newHours);
    onChange(newHours);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Horaires d'ouverture</h3>
      </div>

      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const dayHours = hours[key];
          return (
            <div key={key} className="flex flex-col md:flex-row md:items-center gap-3 p-4 border rounded-lg bg-card">
              <div className="w-full md:w-28 font-medium">{label}</div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={!dayHours.closed}
                  onCheckedChange={(checked) => updateDay(key, { closed: !checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {dayHours.closed ? 'Fermé' : 'Ouvert'}
                </span>
              </div>

              {!dayHours.closed && (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => updateDay(key, { open: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-background"
                    />
                    <span className="text-muted-foreground">à</span>
                    <input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => updateDay(key, { close: e.target.value })}
                      className="px-3 py-2 border rounded-lg bg-background"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToAll(key)}
                    className="ml-auto"
                  >
                    Copier à tous
                  </Button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
        <p className="font-medium mb-1 text-blue-900 dark:text-blue-100">Les créneaux horaires sont générés automatiquement</p>
        <p className="text-blue-700 dark:text-blue-300">
          Lorsque les clients réservent des services, les créneaux disponibles seront créés automatiquement
          en fonction de ces horaires et de la durée du service.
        </p>
      </div>
    </Card>
  );
}
