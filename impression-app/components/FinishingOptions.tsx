'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, FINISHING_OPTIONS } from '@/lib/pricing';
import { FinishingOption } from '@/types/order';

const fallbackIcons: Record<string, React.ReactNode> = {
  spiral: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
      <path d="M12 2C6.48 2 2 5.58 2 10c0 2.21 1.34 4.22 3.5 5.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5C20.66 14.22 22 12.21 22 10c0-4.42-4.48-8-10-8z" />
      <path d="M8 10h8M8 14h8" strokeLinecap="round" />
    </svg>
  ),
  book: <BookOpen className="w-8 h-8" />,
};

interface FinishingOptionsProps {
  selected: FinishingOption;
  onSelect: (option: FinishingOption) => void;
}

function OptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: (typeof FINISHING_OPTIONS)[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 text-left w-full',
        isSelected
          ? 'border-blue-700 shadow-lg shadow-blue-100'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      )}
    >
      {/* Badge radio */}
      <div className={cn(
        'absolute top-3 right-3 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center',
        isSelected ? 'border-blue-700 bg-blue-700' : 'border-white bg-white/80'
      )}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>

      {/* Image */}
      <div className={cn(
        'w-full h-40 flex items-center justify-center overflow-hidden',
        isSelected ? 'bg-blue-50' : 'bg-gray-100'
      )}>
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={option.image}
            alt={option.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={cn(
            'flex flex-col items-center gap-2',
            isSelected ? 'text-blue-400' : 'text-gray-400'
          )}>
            {fallbackIcons[option.icon]}
            <span className="text-xs text-gray-400">Aucune image</span>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className={cn(
        'flex flex-col gap-1 p-4',
        isSelected ? 'bg-blue-50' : 'bg-white'
      )}>
        <span className={cn(
          'font-bold text-sm leading-snug',
          isSelected ? 'text-blue-800' : 'text-gray-800'
        )}>
          {option.name}
        </span>
        <p className="text-xs text-gray-500 leading-snug">{option.description}</p>
        <span className={cn(
          'font-bold text-sm mt-1',
          isSelected ? 'text-orange-500' : 'text-gray-600'
        )}>
          +{formatPrice(option.price)}
        </span>
      </div>
    </button>
  );
}

export function FinishingOptionsComponent({ selected, onSelect }: FinishingOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FINISHING_OPTIONS.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          isSelected={selected === option.id}
          onSelect={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}
