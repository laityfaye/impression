'use client';

import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
import { STEPS } from '@/types/order';
import { cn } from '@/lib/utils';

export function StepIndicator() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => s.path === pathname);

  return (
    <div className="w-full py-4 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">

          {/* Ligne de fond */}
          <div className="absolute top-4 left-0 right-0 h-px bg-gray-200 z-0" />
          {/* Ligne de progression */}
          <div
            className="absolute top-4 left-0 h-px bg-blue-700 z-0 transition-all duration-500"
            style={{
              width: currentIndex === 0 ? '0%' : `${(currentIndex / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={step.id} className="flex flex-col items-center z-10 gap-1.5">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300',
                    isCompleted && 'bg-blue-700 border-blue-700 text-white',
                    isCurrent && 'bg-white border-blue-700 text-blue-700 ring-4 ring-blue-50 shadow-sm',
                    isPending && 'bg-white border-gray-200 text-gray-400'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium text-center hidden sm:block whitespace-nowrap',
                    isCurrent && 'text-blue-700',
                    isCompleted && 'text-blue-500',
                    isPending && 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
