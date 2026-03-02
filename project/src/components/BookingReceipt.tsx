import React, { useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

interface BookingReceiptProps {
  booking: {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    service_summary: string;
    start_at: string;
    end_at: string;
    status: string;
    total_price: number;
    notes?: string;
    created_at?: string;
  };
  business: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  receiptNumber?: string;
}

const BookingReceipt: React.FC<BookingReceiptProps> = ({ booking, business, receiptNumber }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reçu - ${receiptNumber || booking.id.slice(0, 8)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: #000;
            }
            .receipt {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #000;
              padding: 30px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #000;
            }
            .logo-section { flex: 1; }
            .business-info {
              flex: 1;
              text-align: right;
              font-size: 12px;
              line-height: 1.6;
            }
            .business-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .receipt-title {
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              margin: 30px 0 20px;
              text-transform: uppercase;
            }
            .receipt-number {
              text-align: center;
              font-size: 14px;
              color: #666;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 12px;
              color: #333;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 150px 1fr;
              gap: 10px;
              font-size: 14px;
              line-height: 1.8;
            }
            .label {
              font-weight: 600;
              color: #555;
            }
            .value {
              color: #000;
            }
            .service-line {
              display: flex;
              justify-content: space-between;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 4px;
              margin-bottom: 10px;
            }
            .service-details { flex: 1; }
            .service-name {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .service-time {
              font-size: 13px;
              color: #666;
            }
            .service-price {
              font-size: 20px;
              font-weight: bold;
              color: #000;
            }
            .total-section {
              margin-top: 30px;
              padding: 20px;
              background: #000;
              color: #fff;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .total-label {
              font-size: 18px;
              font-weight: bold;
            }
            .total-amount {
              font-size: 32px;
              font-weight: bold;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-confirmed { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #854d0e; }
            .status-completed { background: #dbeafe; color: #1e40af; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px dashed #999;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .notes-section {
              margin-top: 20px;
              padding: 15px;
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              font-size: 13px;
            }
            @media print {
              body { padding: 0; }
              .receipt { border: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-[#c8a2c9]/20 text-[#c8a2c9]';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div>
      <div className="flex space-x-3 mb-4 print:hidden">
        <Button onClick={handlePrint} className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </Button>
      </div>

      <div ref={printRef} className="receipt bg-white text-gray-900 border-2 border-gray-300 rounded-lg p-8 max-w-4xl mx-auto">
        <div className="header border-b-2 border-gray-900 pb-6 mb-6 flex justify-between items-start">
          <div className="logo-section flex-1">
            <div className="w-24 h-24">
              <Logo />
            </div>
          </div>
          <div className="business-info flex-1 text-right text-sm text-gray-900">
            <div className="text-xl font-bold mb-2 text-gray-900">{business.name}</div>
            {business.address && <div className="text-gray-700">{business.address}</div>}
            {business.phone && <div className="text-gray-700">Tél: {business.phone}</div>}
            {business.email && <div className="text-gray-700">{business.email}</div>}
          </div>
        </div>

        <div className="receipt-title text-center text-3xl font-bold my-8 uppercase text-gray-900">Reçu de Réservation</div>
        <div className="receipt-number text-center text-sm text-gray-600 mb-8">
          Nº {receiptNumber || booking.id.slice(0, 8).toUpperCase()}
        </div>

        <div className="section mb-8">
          <div className="section-title text-sm font-bold uppercase mb-3 text-gray-800">Informations Client</div>
          <div className="info-grid grid grid-cols-[150px_1fr] gap-3 text-sm">
            <div className="label font-semibold text-gray-700">Nom:</div>
            <div className="value text-gray-900">{booking.customer_name}</div>
            <div className="label font-semibold text-gray-700">Téléphone:</div>
            <div className="value text-gray-900">{booking.customer_phone}</div>
            {booking.customer_email && (
              <>
                <div className="label font-semibold text-gray-700">Email:</div>
                <div className="value text-gray-900">{booking.customer_email}</div>
              </>
            )}
          </div>
        </div>

        <div className="section mb-8">
          <div className="section-title text-sm font-bold uppercase mb-3 text-gray-800">Détails de la Réservation</div>
          <div className="info-grid grid grid-cols-[150px_1fr] gap-3 text-sm">
            <div className="label font-semibold text-gray-700">Date:</div>
            <div className="value text-gray-900">
              {format(new Date(booking.start_at), 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
            <div className="label font-semibold text-gray-700">Heure:</div>
            <div className="value text-gray-900">
              {format(new Date(booking.start_at), 'HH:mm')} - {format(new Date(booking.end_at), 'HH:mm')}
            </div>
            <div className="label font-semibold text-gray-700">Statut:</div>
            <div className="value">
              <span className={`status-badge inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase ${getStatusClass(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
            </div>
            {booking.created_at && (
              <>
                <div className="label font-semibold text-gray-700">Réservé le:</div>
                <div className="value text-gray-900">
                  {format(new Date(booking.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="section mb-8">
          <div className="section-title text-sm font-bold uppercase mb-3 text-gray-800">Service</div>
          <div className="service-line flex justify-between items-center p-4 bg-gray-100 rounded-lg">
            <div className="service-details flex-1">
              <div className="service-name font-bold text-base mb-1 text-gray-900">{booking.service_summary}</div>
              <div className="service-time text-sm text-gray-600">
                Durée: {Math.round((new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / 60000)} minutes
              </div>
            </div>
            <div className="service-price text-xl font-bold text-gray-900">{booking.total_price} DH</div>
          </div>
        </div>

        {booking.notes && (
          <div className="notes-section mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-sm text-gray-900">
            <strong className="text-gray-900">Notes:</strong> {booking.notes}
          </div>
        )}

        <div className="total-section mt-8 p-6 bg-gray-900 text-white rounded-lg flex justify-between items-center">
          <div className="total-label text-lg font-bold">TOTAL À PAYER</div>
          <div className="total-amount text-4xl font-bold">{booking.total_price} DH</div>
        </div>

        <div className="footer mt-10 pt-6 border-t border-dashed border-gray-400 text-center text-sm text-gray-600">
          <p className="text-gray-700">Merci pour votre confiance!</p>
          <p className="mt-2 text-gray-600">
            Ce reçu confirme votre réservation. Veuillez le présenter le jour de votre rendez-vous.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Imprimé le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingReceipt;
