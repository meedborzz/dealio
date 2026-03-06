import React from 'react';
import { User } from 'lucide-react';
import { Input } from '../ui/input';

interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
}

interface BookingFormSectionProps {
  bookingData: BookingFormData;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeEmail: (value: string) => void;
}

const BookingFormSection = React.forwardRef<HTMLDivElement, BookingFormSectionProps>(
  ({ bookingData, onChangeName, onChangePhone, onChangeEmail }, ref) => {
    return (
      <div ref={ref} className="space-y-4">
        <h3 className="text-[17px] font-black tracking-tight text-foreground uppercase flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          Vos informations
        </h3>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase ml-4">Nom complet *</label>
            <div className="relative group">
              <Input
                type="text"
                value={bookingData.customerName}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="Ex: Mohamed Berhiche"
                className="h-14 rounded-[1.25rem] border-2 bg-card/50 transition-all duration-300 focus:ring-primary/20 group-hover:border-primary/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase ml-4">Téléphone *</label>
            <div className="relative group">
              <Input
                type="tel"
                value={bookingData.customerPhone}
                onChange={(e) => onChangePhone(e.target.value)}
                placeholder="+212 6XXXXXXXX"
                className="h-14 rounded-[1.25rem] border-2 bg-card/50 transition-all duration-300 focus:ring-primary/20 group-hover:border-primary/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase ml-4">Email *</label>
            <div className="relative group">
              <Input
                type="email"
                value={bookingData.customerEmail}
                onChange={(e) => onChangeEmail(e.target.value)}
                placeholder="votre@email.com"
                className="h-14 rounded-[1.25rem] border-2 bg-card/50 transition-all duration-300 focus:ring-primary/20 group-hover:border-primary/30"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BookingFormSection.displayName = 'BookingFormSection';

export default React.memo(BookingFormSection);
