'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Wrench,
  RefreshCw,
} from 'lucide-react';
import { useOrderStore } from '@/lib/store';
import { PricingCard } from '@/components/PricingCard';
import { formatPrice, CORRECTION_SERVICE_PRICE } from '@/lib/pricing';
import { VerifyApiResponse } from '@/types/order';
import { cn } from '@/lib/utils';

type VerificationStatus = 'loading' | 'ok' | 'issues' | 'error';

const CHECKS = ['Intégrité du fichier', 'Orientation des pages', 'Mise en page'];

export default function VerificationPage() {
  const router = useRouter();
  const { document, correctionService, setCorrectionService, setDocument } = useOrderStore();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [verifyData, setVerifyData] = useState<VerifyApiResponse | null>(null);

  useEffect(() => {
    if (!document) {
      router.replace('/');
      return;
    }
    runVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runVerification = async () => {
    if (!document) return;
    setStatus('loading');
    try {
      const response = await fetch('/api/verify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: document.name, pageCount: document.pageCount }),
      });
      const data: VerifyApiResponse = await response.json();
      setVerifyData(data);
      if (data.valid) {
        setStatus('ok');
        setDocument({ ...document, hasIssues: false });
      } else {
        setStatus('issues');
        setDocument({ ...document, hasIssues: true, issueDetails: data.issues });
      }
    } catch {
      setStatus('error');
    }
  };

  if (!document) return null;

  return (
    <main className="min-h-[calc(100vh-120px)] flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">

        <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Loader2 className={cn('w-5 h-5 text-white', status === 'loading' ? 'animate-spin' : 'hidden')} />
            <CheckCircle className={cn('w-5 h-5 text-white', status === 'ok' ? 'block' : 'hidden')} />
            <AlertTriangle className={cn('w-5 h-5 text-white', (status === 'issues' || status === 'error') ? 'block' : 'hidden')} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vérification du document</h1>
            <p className="text-gray-400 text-sm">
              Vérification automatique de la compatibilité de votre PDF avec nos critères d&apos;impression.
            </p>
          </div>
        </div>

        <div className="flex gap-6 items-stretch">

          {/* Pricing Card */}
          <div className="w-72 flex-shrink-0">
            <PricingCard pageCount={document.pageCount} fileName={document.name} />
          </div>

          {/* Verification card */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Analyse du document</h2>
              <p className="text-xs text-gray-400 mt-0.5">Vérification de la mise en page et de l&apos;intégrité</p>
            </div>

            <div className="p-5 space-y-4">

              {/* LOADING */}
              {status === 'loading' && (
                <div className="flex flex-col items-center gap-5 py-4">
                  <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
                  <div className="w-full space-y-2">
                    {CHECKS.map(check => (
                      <div key={check} className="flex items-center gap-3 text-sm text-gray-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 flex-shrink-0" />
                        {check}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OK */}
              {status === 'ok' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800 text-sm">Document prêt pour impression</p>
                      <p className="text-xs text-green-600 mt-0.5">Aucun problème détecté.</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {CHECKS.map(check => (
                      <div key={check} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        {check}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ISSUES */}
              {status === 'issues' && verifyData && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3.5 bg-orange-50 border border-orange-200 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-800 text-sm">Problèmes détectés</p>
                      <ul className="mt-1.5 space-y-1">
                        {verifyData.issues.map((issue, i) => (
                          <li key={i} className="text-xs text-orange-700 flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Correction service */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Wrench className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">Correction de mise en page</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Notre équipe corrigera les problèmes avant l&apos;impression.
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                        +{formatPrice(CORRECTION_SERVICE_PRICE)}
                      </span>
                    </div>
                    <button
                      onClick={() => setCorrectionService(!correctionService)}
                      className={cn(
                        'mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors',
                        correctionService
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {correctionService ? 'Service ajouté ✓' : 'Ajouter ce service'}
                    </button>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {status === 'error' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 text-sm">Erreur de vérification</p>
                      <p className="text-xs text-red-600 mt-0.5">
                        Impossible de vérifier le document. Vous pouvez réessayer ou continuer.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={runVerification}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Réessayer l&apos;analyse
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <button
            onClick={() => router.push('/finitions')}
            disabled={status === 'loading'}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            Continuer
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </main>
  );
}
