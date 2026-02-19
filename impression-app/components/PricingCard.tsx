'use client';

import { FileText, Calculator } from 'lucide-react';
import {
  formatPrice,
  calculatePrintingCost,
  pricePerPage,
  PRICE_PER_PAGE_LOW,
  PRICE_PER_PAGE_HIGH,
  PRICE_THRESHOLD,
} from '@/lib/pricing';

interface PricingCardProps {
  pageCount: number;
  fileName: string;
}

export function PricingCard({ pageCount, fileName }: PricingCardProps) {
  const total = calculatePrintingCost(pageCount);
  const unitPrice = pricePerPage(pageCount);
  const isHighRate = pageCount <= PRICE_THRESHOLD;

  return (
    <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-5 text-white shadow-xl h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
          <Calculator className="w-4 h-4 text-orange-300" />
        </div>
        <h3 className="font-semibold">Estimation du coût</h3>
      </div>

      <div className="flex items-center gap-3 mb-4 bg-white/10 rounded-xl p-3">
        <FileText className="w-4 h-4 text-blue-200 flex-shrink-0" />
        <span className="text-sm text-blue-100 truncate">{fileName}</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-blue-100 text-sm">
          <span>Nombre de pages</span>
          <span className="font-semibold text-white">{pageCount} pages</span>
        </div>
        <div className="flex justify-between items-center text-blue-100 text-sm">
          <span>Prix par page</span>
          <span className="font-semibold text-white">{formatPrice(unitPrice)}</span>
        </div>
        <div className="border-t border-white/20 pt-2 flex justify-between items-center">
          <span className="font-medium text-sm">Coût d&apos;impression</span>
          <span className="text-xl font-bold text-orange-300">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Grille tarifaire */}
      <div className="mt-4 border-t border-white/10 pt-3 space-y-1.5">
        <p className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold mb-2">Grille tarifaire</p>
        <div className={`flex justify-between items-center text-xs px-2.5 py-1.5 rounded-lg ${isHighRate ? 'bg-orange-400/20 text-white' : 'text-blue-300'}`}>
          <span>10 – 50 pages</span>
          <span className="font-bold">{formatPrice(PRICE_PER_PAGE_LOW)} / page</span>
        </div>
        <div className={`flex justify-between items-center text-xs px-2.5 py-1.5 rounded-lg ${!isHighRate ? 'bg-orange-400/20 text-white' : 'text-blue-300'}`}>
          <span>+ de 50 pages</span>
          <span className="font-bold">{formatPrice(PRICE_PER_PAGE_HIGH)} / page</span>
        </div>
      </div>
    </div>
  );
}
