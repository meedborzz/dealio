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
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Vos informations
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Nom complet *</label>
            <Input
              type="text"
              value={bookingData.customerName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Votre nom complet"
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Telephone *</label>
            <Input
              type="tel"
              value={bookingData.customerPhone}
              onChange={(e) => onChangePhone(e.target.value)}
              placeholder="+212 6XX XXX XXX"
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email *</label>
            <Input
              type="email"
              value={bookingData.customerEmail}
              onChange={(e) => onChangeEmail(e.target.value)}
              placeholder="votre@email.com"
              className="h-10"
            />
          </div>
        </div>
      </div>
    );
  }
);

BookingFormSection.displayName = 'BookingFormSection';

export default React.memo(BookingFormSection);
