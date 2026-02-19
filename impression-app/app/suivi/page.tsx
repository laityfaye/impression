'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Loader2,
  CheckCircle,
  Clock,
  Printer,
  AlertCircle,
  ArrowLeft,
  Package,
  FileText,
  Truck,
  Wrench,
} from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface OrderStatus {
  orderNumber: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'done';
  statusLabel: string;
  statusDescription: string;
  pageCount: number;
  finishing: string | null;
  correctionService: boolean;
  delivery: string;
  totalPrice: number;
}

const STATUS_STYLES = {
  pending: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: Clock,
    iconColor: 'text-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-400',
  },
  processing: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Printer,
    iconColor: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500 animate-pulse',
  },
  done: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    badge: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
  },
};

const STEPS = [
  { key: 'pending', label: 'Commande reçue' },
  { key: 'processing', label: 'Impression en cours' },
  { key: 'done', label: 'Prête à récupérer' },
];

function SuiviContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [input, setInput] = useState(searchParams.get('commande') ?? '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState('');

  // Lancer la recherche automatiquement si le numéro est passé en URL
  useEffect(() => {
    const num = searchParams.get('commande');
    if (num) {
      setInput(num);
      handleSearch(num);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (num?: string) => {
    const orderNum = (num ?? input).trim().replace(/^#/, '');
    if (!orderNum) {
      setError('Veuillez saisir un numéro de commande.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${orderNum}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Commande introuvable.');
        return;
      }
      setOrder(data);
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order
    ? STEPS.findIndex((s) => s.key === order.status)
    : -1;

  const styles = order ? STATUS_STYLES[order.status] : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <main className="min-h-[calc(100vh-120px)] flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">

        {/* Header */}
        <div>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-xl mb-4 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Suivi de commande</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Entrez votre numéro de commande pour consulter son état.
          </p>
        </div>

        {/* Champ de recherche */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de commande
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
                #
              </span>
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex : 483920"
                maxLength={6}
                className="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono tracking-widest"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Rechercher
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Résultat */}
        {order && styles && (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-in-out]">

            {/* Statut principal */}
            <div className={cn('rounded-2xl border-2 p-5', styles.bg, styles.border)}>
              <div className="flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', styles.bg)}>
                  {(() => { const Icon = styles.icon; return <Icon className={cn('w-7 h-7', styles.iconColor)} />; })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', styles.badge)}>
                      {order.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{order.statusDescription}</p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mt-5">
                <div className="flex items-center justify-between relative">
                  {/* Ligne de fond */}
                  <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-gray-200" />
                  {/* Ligne de progression */}
                  <div
                    className="absolute top-3.5 left-0 h-0.5 bg-blue-600 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                  />
                  {STEPS.map((step, i) => {
                    const isDone = i <= currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                            isDone
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-200'
                          )}
                        >
                          {isDone && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <span className={cn('text-xs font-medium text-center max-w-[70px] leading-snug', isDone ? 'text-blue-700' : 'text-gray-400')}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Détails de la commande */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Commande #{order.orderNumber}</span>
                  <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Impression ({order.pageCount} pages)
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {formatPrice(order.pageCount * 60)}
                  </span>
                </div>

                {order.finishing && (
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Package className="w-4 h-4 text-gray-400" />
                      Finition – {order.finishing}
                    </div>
                    <span className="text-sm font-medium text-gray-800">Inclus</span>
                  </div>
                )}

                {order.correctionService && (
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Wrench className="w-4 h-4 text-gray-400" />
                      Correction mise en page
                    </div>
                    <span className="text-sm font-medium text-gray-800">Inclus</span>
                  </div>
                )}

                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-gray-400" />
                    Livraison
                  </div>
                  <span className={cn('text-sm font-medium', order.delivery === 'partner' ? 'text-green-600' : 'text-orange-500')}>
                    {order.delivery === 'partner' ? 'Gratuite' : 'À définir'}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-gray-100 bg-gray-50 px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Total</span>
                <span className="text-2xl font-extrabold text-blue-800">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>

            {/* Note de contact */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-1">
              <p>📞 Si vous avez des questions, citez votre numéro de commande <strong>#{order.orderNumber}</strong> et appelez-nous :</p>
              <p className="font-semibold">
                <a href="tel:+221769365811" className="hover:underline">76 936 58 11</a>
                {' '}·{' '}
                <a href="tel:+221780186229" className="hover:underline">78 018 62 29</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SuiviPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <SuiviContent />
    </Suspense>
  );
}
