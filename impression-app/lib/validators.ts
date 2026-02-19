import { z } from 'zod';

export const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.type === 'application/pdf', 'Seuls les fichiers PDF sont acceptés')
    .refine((f) => f.size <= 50 * 1024 * 1024, 'Le fichier ne doit pas dépasser 50 Mo'),
});

export const orderSchema = z.object({
  document: z.object({
    name: z.string().min(1),
    pageCount: z.number().min(50),
    hasIssues: z.boolean(),
  }),
  finishing: z.enum(['agraphage', 'reliure', 'livre']).nullable(),
  delivery: z.enum(['partner', 'other']),
  selectedInstitute: z.string().nullable(),
});

export type UploadSchema = z.infer<typeof uploadSchema>;
export type OrderSchema = z.infer<typeof orderSchema>;
