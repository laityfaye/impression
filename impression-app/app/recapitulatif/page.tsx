'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Loader2, CreditCard } from 'lucide-react';
import { useOrderStore } from '@/lib/store';
import { OrderSummary } from '@/components/OrderSummary';
import { SuccessModal } from '@/components/SuccessModal';

function generateOrderNumber(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function RecapitulatifPage() {
  const router = useRouter();
  const { document, delivery, recalculateTotal } = useOrderStore();
  // useOrderStore.getState() utilisé dans handleValidate pour accéder aux valeurs sans re-render
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!document) {
      router.replace('/');
      return;
    }
    if (!delivery) {
      router.replace('/livraison');
      return;
    }
    recalculateTotal();
  }, [document, delivery, router, recalculateTotal]);

  const handleValidate = async () => {
    if (!document) return;
    setIsSubmitting(true);
    const num = generateOrderNumber();
    try {
      const { correctionService, finishing, delivery, selectedInstitute, totalPrice, client, copies } =
        useOrderStore.getState();
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: num,
          document,
          client,
          correctionService,
          finishing,
          delivery,
          selectedInstitute,
          copies: copies ?? 1,
          totalPrice,
        }),
      });
    } catch {
      // La commande s'affiche quand même si l'API échoue
    }
    setOrderNumber(num);
    setIsSubmitting(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/');
  };

  if (!document) return null;

  return (
    <main className="min-h-[calc(100vh-120px)] flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Récapitulatif de commande</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Vérifiez les détails de votre commande avant de valider.
          </p>
        </div>

        <OrderSummary />

        {/* Payment note */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <CreditCard className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Note sur le paiement</p>
            <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
              Le paiement sera effectué lors de la récupération de votre document imprimé. Un agent vous contactera pour confirmer les détails.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/livraison')}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <button
            onClick={handleValidate}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-md shadow-orange-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                Valider ma commande
              </>
            )}
          </button>
        </div>
      </div>

      <SuccessModal
        isOpen={showModal}
        onClose={handleCloseModal}
        orderNumber={orderNumber}
      />
    </main>
  );
}
