'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, Package, Search, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

export function SuccessModal({ isOpen, onClose, orderNumber }: SuccessModalProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTrack = () => {
    onClose();
    router.push(`/suivi?commande=${orderNumber}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300',
          visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête verte */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-t-2xl p-6 text-white text-center">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center animate-bounce">
              <Package className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Commande enregistrée !</h2>
          <p className="text-green-100 text-sm mt-1">
            Vous serez contacté pour le paiement et la livraison.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Numéro de commande — bien mis en avant */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider text-center mb-2">
              Votre numéro de commande
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-3xl font-extrabold text-blue-800 tracking-widest flex-1 text-center">
                #{orderNumber}
              </p>
              <button
                onClick={handleCopy}
                title="Copier le numéro"
                className="flex items-center gap-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-3 py-2 rounded-lg transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>

          {/* Message d'alerte important */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Retenez bien ce numéro !</p>
              <p className="text-amber-700 mt-0.5 leading-snug">
                Il vous permettra de <strong>suivre l&apos;état de votre commande</strong> à tout moment sur notre plateforme.
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              onClick={handleTrack}
              className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
              Suivre ma commande
            </button>
            <button
              onClick={onClose}
              className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
