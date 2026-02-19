export const MIN_PAGES = 10;

/** Seuil de pages : ≤ ce seuil → tarif 80 FCFA ; > ce seuil → tarif 60 FCFA */
export const PRICE_THRESHOLD = 50;

export const PRICE_PER_PAGE_LOW  = 80; // FCFA — 10 à 50 pages
export const PRICE_PER_PAGE_HIGH = 60; // FCFA — plus de 50 pages

/** Tarif unitaire applicable pour un document de `pageCount` pages */
export function pricePerPage(pageCount: number): number {
  return pageCount <= PRICE_THRESHOLD ? PRICE_PER_PAGE_LOW : PRICE_PER_PAGE_HIGH;
}

export const FINISHING_PRICES = {
  reliure: 350,
  livre: 2500,
} as const;

export const CORRECTION_SERVICE_PRICE = 2000;

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-SN').format(amount) + ' FCFA';
}

export function calculatePrintingCost(pageCount: number): number {
  return pageCount * pricePerPage(pageCount);
}

export function calculateTotal(
  pageCount: number,
  finishing: 'reliure' | 'livre' | null,
  correctionService: boolean
): number {
  let total = calculatePrintingCost(pageCount);
  if (finishing) {
    total += FINISHING_PRICES[finishing];
  }
  if (correctionService) {
    total += CORRECTION_SERVICE_PRICE;
  }
  return total;
}

export const FINISHING_OPTIONS = [
  {
    id: 'reliure' as const,
    name: 'Reliure spirale',
    description: 'Reliure par spirale plastique ou métallique',
    price: FINISHING_PRICES.reliure,
    icon: 'spiral',
    image: '/finitions/reliure.jpg',
  },
  {
    id: 'livre' as const,
    name: 'Format Livre',
    description: 'Reliure professionnelle façon livre, idéale pour mémoires et thèses',
    price: FINISHING_PRICES.livre,
    icon: 'book',
    image: '/finitions/livre.jpg',
  },
] as const;
