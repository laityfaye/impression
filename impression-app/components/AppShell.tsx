'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Printer } from 'lucide-react';
import { STEPS } from '@/types/order';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isSuivi = pathname === '/suivi';
  const currentIndex = STEPS.findIndex((s) => s.path === pathname);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {/* ── Navbar unifiée bleue ── */}
      <header className="bg-blue-600 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <nav className="flex items-center gap-2 sm:gap-4 py-3 sm:py-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 border border-white/30 rounded-lg flex items-center justify-center">
                <Printer className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-white text-sm sm:text-base tracking-tight whitespace-nowrap">
                UIDT<span className="text-blue-200">Impression</span>
              </span>
            </Link>

            {/* Steps — masqués sur /suivi */}
            {!isSuivi ? (
              <div className="flex-1 flex items-center justify-center relative px-1 sm:px-2 min-w-0 overflow-hidden">
                {/* Ligne de fond */}
                <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-px bg-white/15" />
                {/* Ligne de progression */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-2 h-px bg-white/50 transition-all duration-500"
                  style={{
                    width: currentIndex <= 0
                      ? '0%'
                      : `${(currentIndex / (STEPS.length - 1)) * 92}%`,
                  }}
                />
                <div className="flex items-center justify-between w-full relative z-10">
                  {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-1">
                        <div className={cn(
                          'w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 transition-all',
                          isCompleted && 'bg-white border-white text-blue-600',
                          isCurrent  && 'bg-white border-white text-blue-700 shadow-md shadow-blue-900/40',
                          !isCompleted && !isCurrent && 'bg-white/10 border-white/20 text-white/40',
                        )}>
                          {index + 1}
                        </div>
                        <span className={cn(
                          'text-[10px] font-semibold whitespace-nowrap hidden sm:block',
                          isCurrent   ? 'text-white'    :
                          isCompleted ? 'text-blue-200' : 'text-white/30',
                        )}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Lien suivi */}
            <div className="flex-shrink-0">
              <Link
                href="/suivi"
                className="flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white bg-white/15 hover:bg-white/25 border border-white/20 px-2.5 sm:px-3 py-1.5 rounded-full transition-all"
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Suivre ma commande</span>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Content — key={pathname} force le remontage et déclenche l'animation à chaque navigation */}
      <div key={pathname} className="max-w-3xl mx-auto page-transition">
        {children}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center space-y-1">
          <p className="text-xs text-gray-500 font-medium">
            Contactez-nous :{' '}
            <a href="tel:+221769365811" className="text-blue-700 hover:underline">76 936 58 11</a>
            {' '}·{' '}
            <a href="tel:+221780186229" className="text-blue-700 hover:underline">78 018 62 29</a>
          </p>
          <p className="text-xs text-gray-400">© 2025 ImpressionPro · Thiès, Sénégal · Tous droits réservés</p>
        </div>
      </footer>
    </>
  );
}
