'use client';

import { Building2, User, MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeliveryType } from '@/types/order';
import { useInstitutes } from '@/lib/useInstitutes';
import { useState } from 'react';

interface DeliveryOptionsProps {
  selected: DeliveryType;
  selectedInstitute: string | null;
  onSelect: (type: DeliveryType, institute?: string | null) => void;
}

export function DeliveryOptionsComponent({ selected, selectedInstitute, onSelect }: DeliveryOptionsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const institutes = useInstitutes();

  const selectedInstituteName = institutes.find((i) => i.id === selectedInstitute)?.name;

  return (
    <div className="space-y-3">
      {/* Partner institute option — div instead of button to allow nested buttons */}
      <div
        role="radio"
        aria-checked={selected === 'partner'}
        tabIndex={0}
        onClick={() => onSelect('partner', selectedInstitute)}
        onKeyDown={(e) => e.key === 'Enter' && onSelect('partner', selectedInstitute)}
        className={cn(
          'press-feedback w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none',
          selected === 'partner'
            ? 'border-blue-700 bg-blue-50 shadow-md shadow-blue-100'
            : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
        )}
      >
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
            selected === 'partner' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500'
          )}
        >
          <Building2 className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'font-semibold text-base',
                selected === 'partner' ? 'text-blue-800' : 'text-gray-800'
              )}
            >
              Institut partenaire à Thiès
            </span>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              Gratuit
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Récupération dans votre établissement partenaire
          </p>

          {selected === 'partner' && (
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs text-blue-600 font-medium mb-2">Choisissez votre institut :</p>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="w-full flex items-center justify-between bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-left hover:border-blue-400 transition-colors"
                >
                  <span className={selectedInstitute ? 'text-gray-800' : 'text-gray-400'}>
                    {selectedInstituteName || 'Sélectionner un institut...'}
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isDropdownOpen && 'rotate-180')} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    {institutes.map((institute) => (
                      <button
                        key={institute.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect('partner', institute.id);
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-blue-50 transition-colors',
                          selectedInstitute === institute.id && 'bg-blue-50 text-blue-700 font-medium'
                        )}
                      >
                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        {institute.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1',
            selected === 'partner' ? 'border-blue-700 bg-blue-700' : 'border-gray-300'
          )}
        >
          {selected === 'partner' && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>

      {/* Other client option */}
      <div
        role="radio"
        aria-checked={selected === 'other'}
        tabIndex={0}
        onClick={() => onSelect('other', null)}
        onKeyDown={(e) => e.key === 'Enter' && onSelect('other', null)}
        className={cn(
          'press-feedback w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none',
          selected === 'other'
            ? 'border-blue-700 bg-blue-50 shadow-md shadow-blue-100'
            : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
        )}
      >
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
            selected === 'other' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500'
          )}
        >
          <User className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'font-semibold text-base',
                selected === 'other' ? 'text-blue-800' : 'text-gray-800'
              )}
            >
              Autre client
            </span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              À définir
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Vous serez contacté pour définir les modalités de récupération
          </p>

          {selected === 'other' && (
            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
              <p className="text-sm text-orange-700 font-medium">
                📞 Un agent vous contactera après la validation de votre commande pour convenir d&apos;un lieu et d&apos;une heure de récupération.
              </p>
            </div>
          )}
        </div>

        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1',
            selected === 'other' ? 'border-blue-700 bg-blue-700' : 'border-gray-300'
          )}
        >
          {selected === 'other' && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </div>
  );
}
