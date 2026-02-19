'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { useOrderStore } from '@/lib/store';
import { FinishingOptionsComponent } from '@/components/FinishingOptions';
import { FinishingOption } from '@/types/order';

export default function FinitionsPage() {
  const router = useRouter();
  const { document, finishing, setFinishing } = useOrderStore();
  const [selected, setSelected] = useState<FinishingOption>(finishing);

  useEffect(() => {
    if (!document) {
      router.replace('/');
    }
  }, [document, router]);

  const handleContinue = () => {
    setFinishing(selected);
    router.push('/livraison');
  };

  if (!document) return null;

  return (
    <main className="min-h-[calc(100vh-120px)] flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Options de finition</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Choisissez une finition pour votre document.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <FinishingOptionsComponent
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Summary note */}
        {selected && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Finition sélectionnée : <strong>{selected}</strong>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/verification')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-colors"
          >
            Continuer
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
