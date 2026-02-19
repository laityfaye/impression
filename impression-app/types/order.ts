export type FinishingOption = 'reliure' | 'livre' | null;
export type DeliveryType = 'partner' | 'other' | null;

export interface DocumentInfo {
  name: string;
  pageCount: number;
  hasIssues: boolean;
  issueDetails?: string[];
  savedFileName?: string; // nom du fichier sauvegardé sur le serveur
}

export interface OrderState {
  document: DocumentInfo | null;
  correctionService: boolean;
  finishing: FinishingOption;
  delivery: DeliveryType;
  selectedInstitute: string | null;
  totalPrice: number;
}

export interface UploadApiResponse {
  pageCount: number;
  fileName: string;
  savedFileName?: string;
  valid: boolean;
  reason?: string;
}

export interface VerifyApiResponse {
  valid: boolean;
  issues: string[];
  orientationOk: boolean;
}

export const PARTNER_INSTITUTES = [
  { id: 'ufr-sante', name: 'UFR Santé - Université de Thiès' },
  { id: 'isa', name: 'ISA - Institut Supérieur des Arts' },
  { id: 'esp-thies', name: 'ESP Thiès - École Supérieure Polytechnique' },
];

export const STEPS = [
  { id: 'upload', label: 'Upload', path: '/' },
  { id: 'verification', label: 'Vérification', path: '/verification' },
  { id: 'finitions', label: 'Finitions', path: '/finitions' },
  { id: 'livraison', label: 'Livraison', path: '/livraison' },
  { id: 'recapitulatif', label: 'Récapitulatif', path: '/recapitulatif' },
] as const;
