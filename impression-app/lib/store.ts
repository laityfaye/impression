import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FinishingOption, DeliveryType, DocumentInfo } from '@/types/order';
import { calculateTotal } from './pricing';

export interface ClientInfo {
  name: string;
  phone: string;
}

interface OrderState {
  document: DocumentInfo | null;
  correctionService: boolean;
  finishing: FinishingOption;
  delivery: DeliveryType;
  selectedInstitute: string | null;
  client: ClientInfo | null;
  totalPrice: number;

  // Actions
  setDocument: (doc: DocumentInfo) => void;
  setCorrectionService: (value: boolean) => void;
  setFinishing: (option: FinishingOption) => void;
  setDelivery: (type: DeliveryType, institute?: string | null, client?: ClientInfo) => void;
  resetOrder: () => void;
  recalculateTotal: () => void;
}

const initialState = {
  document: null,
  correctionService: false,
  finishing: null as FinishingOption,
  delivery: null as DeliveryType,
  selectedInstitute: null,
  client: null as ClientInfo | null,
  totalPrice: 0,
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setDocument: (doc: DocumentInfo) => {
        set({ document: doc });
        get().recalculateTotal();
      },

      setCorrectionService: (value: boolean) => {
        set({ correctionService: value });
        get().recalculateTotal();
      },

      setFinishing: (option: FinishingOption) => {
        set({ finishing: option });
        get().recalculateTotal();
      },

      setDelivery: (type: DeliveryType, institute: string | null = null, client?: ClientInfo) => {
        set({ delivery: type, selectedInstitute: institute, client: client ?? null });
      },

      resetOrder: () => {
        set(initialState);
      },

      recalculateTotal: () => {
        const { document, finishing, correctionService } = get();
        if (!document) return;
        const total = calculateTotal(document.pageCount, finishing, correctionService);
        set({ totalPrice: total });
      },
    }),
    {
      name: 'impression-order',
    }
  )
);
