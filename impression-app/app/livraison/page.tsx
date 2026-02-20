'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Truck, AlertCircle, User, Phone, Copy } from 'lucide-react';
import { useOrderStore, ClientInfo } from '@/lib/store';
import { DeliveryOptionsComponent } from '@/components/DeliveryOptions';
import { DeliveryType } from '@/types/order';
import { cn } from '@/lib/utils';

const EXEMPLAIRES_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export default function LivraisonPage() {
  const router = useRouter();
  const { document, delivery, selectedInstitute, client, copies, setDelivery, setCopies } = useOrderStore();

  const [selected, setSelected] = useState<DeliveryType>(delivery);
  const [institute, setInstitute] = useState<string | null>(selectedInstitute);
  const [exemplaires, setExemplaires] = useState(copies);
  const [clientName, setClientName] = useState(client?.name ?? '');
  const [clientPhone, setClientPhone] = useState(client?.phone ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!document) router.replace('/');
  }, [document, router]);

  useEffect(() => {
    setExemplaires(copies);
  }, [copies]);

  const handleSelect = (type: DeliveryType, inst?: string | null) => {
    setSelected(type);
    setInstitute(inst ?? null);
    setError('');
  };

  const handleContinue = () => {
    if (!selected) {
      setError('Veuillez choisir un mode de livraison.');
      return;
    }
    if (selected === 'partner' && !institute) {
      setError('Veuillez sélectionner un institut partenaire.');
      return;
    }
    if (!clientName.trim()) {
      setError('Veuillez saisir votre nom complet.');
      return;
    }
    if (!clientPhone.trim()) {
      setError('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    let digits = clientPhone.replace(/\D/g, '');
    if (digits.startsWith('221')) digits = digits.slice(3);
    const validPrefixes = ['70', '75', '76', '77', '78'];
    if (digits.length !== 9 || !validPrefixes.some((p) => digits.startsWith(p))) {
      setError('Numéro invalide. Les numéros sénégalais commencent par 70, 75, 76, 77 ou 78 et contiennent 9 chiffres.');
      return;
    }

    setCopies(exemplaires);
    const clientInfo: ClientInfo = { name: clientName.trim(), phone: clientPhone.trim() };
    setDelivery(selected, institute, clientInfo);
    router.push('/recapitulatif');
  };

  if (!document) return null;

  return (
    <main className="min-h-[calc(100vh-120px)] flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Livraison & Contact</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Choisissez votre mode de récupération et laissez vos coordonnées.
          </p>
        </div>

        {/* Nombre d'exemplaires */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Copy className="w-4 h-4 text-blue-600" />
            Nombre d&apos;exemplaires
          </h2>
          <div className="flex items-center gap-3">
            <label htmlFor="exemplaires" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Je commande
            </label>
            <select
              id="exemplaires"
              value={exemplaires}
              onChange={(e) => setExemplaires(Number(e.target.value))}
              className={cn(
                'flex-1 max-w-[120px] px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white'
              )}
            >
              {EXEMPLAIRES_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} exemplaire{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Le montant total sera calculé en fonction du nombre d&apos;exemplaires.
          </p>
        </div>

        {/* Informations client */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Vos coordonnées
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => { setClientName(e.target.value); setError(''); }}
                placeholder="Ex : Lamine FAYE"
                className={cn(
                  'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-500 pointer-events-none">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium border-r border-gray-200 pr-2">+221</span>
                </div>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
                    const fmt = raw
                      .replace(/^(\d{2})(\d{0,3})/, '$1 $2')
                      .replace(/^(\d{2} \d{3})(\d{0,2})/, '$1 $2')
                      .replace(/^(\d{2} \d{3} \d{2})(\d{0,2})/, '$1 $2')
                      .trim();
                    setClientPhone(fmt);
                    setError('');
                  }}
                  placeholder="77 000 00 00"
                  className={cn(
                    'w-full pl-24 pr-4 py-3 border border-gray-200 rounded-xl text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
                  )}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                L&apos;administrateur vous contactera sur ce numéro pour le paiement et la livraison.
              </p>
            </div>
          </div>
        </div>

        {/* Mode de livraison */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-blue-600" />
            Mode de récupération
          </h2>
          <DeliveryOptionsComponent
            selected={selected}
            selectedInstitute={institute}
            onSelect={handleSelect}
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/finitions')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-colors"
          >
            Voir le récapitulatif
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
