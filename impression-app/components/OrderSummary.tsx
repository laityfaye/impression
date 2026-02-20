'use client';

import { FileText, Package, Wrench, Truck, ChevronRight } from 'lucide-react';
import { useOrderStore } from '@/lib/store';
import {
  formatPrice,
  calculatePrintingCost,
  FINISHING_PRICES,
  CORRECTION_SERVICE_PRICE,
  FINISHING_OPTIONS,
} from '@/lib/pricing';
import { useInstitutes } from '@/lib/useInstitutes';

interface SummaryRow {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export function OrderSummary() {
  const { document, finishing, correctionService, delivery, selectedInstitute, totalPrice, copies } =
    useOrderStore();
  const institutes = useInstitutes();
  const exemplaires = Math.max(1, copies ?? 1);

  if (!document) return null;

  const printingCost = calculatePrintingCost(document.pageCount);
  const finishingOption = FINISHING_OPTIONS.find((f) => f.id === finishing);
  const instituteName = institutes.find((i) => i.id === selectedInstitute)?.name;

  const rows: SummaryRow[] = [
    {
      label: exemplaires > 1 ? `Impression (${exemplaires} exemplaires)` : 'Impression',
      value: formatPrice(printingCost * exemplaires),
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  if (finishing && finishingOption) {
    rows.push({
      label: exemplaires > 1 ? `Finition – ${finishingOption.name} (×${exemplaires})` : `Finition – ${finishingOption.name}`,
      value: `+${formatPrice(FINISHING_PRICES[finishing] * exemplaires)}`,
      icon: <Package className="w-4 h-4" />,
    });
  }

  if (correctionService) {
    rows.push({
      label: exemplaires > 1 ? `Correction de mise en page (×${exemplaires})` : 'Correction de mise en page',
      value: `+${formatPrice(CORRECTION_SERVICE_PRICE * exemplaires)}`,
      icon: <Wrench className="w-4 h-4" />,
    });
  }

  rows.push({
    label: delivery === 'partner' ? `Livraison – ${instituteName || 'Institut partenaire'}` : 'Livraison',
    value: delivery === 'partner' ? 'Gratuite' : 'À définir',
    icon: <Truck className="w-4 h-4" />,
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Document header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-200 mb-0.5">Document</p>
            <p className="font-semibold truncate">{document.name}</p>
            <p className="text-sm text-blue-200">
              {document.pageCount} pages
              {exemplaires > 1 && <span> · {exemplaires} exemplaires</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="divide-y divide-gray-50">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center justify-between px-5 py-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                {row.icon}
              </div>
              <span className="text-sm text-gray-700">{row.label}</span>
            </div>
            <span
              className={`text-sm font-semibold ${
                row.value === 'Gratuite'
                  ? 'text-green-600'
                  : row.value === 'À définir'
                  ? 'text-orange-500'
                  : 'text-gray-800'
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t-2 border-gray-100 bg-gray-50 px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total à payer</p>
            <p className="text-3xl font-extrabold text-blue-800 mt-1">{formatPrice(totalPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Paiement après</p>
            <p className="text-xs text-gray-400">confirmation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
