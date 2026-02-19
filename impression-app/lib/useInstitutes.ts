'use client';

import { useState, useEffect } from 'react';
import { PARTNER_INSTITUTES } from '@/types/order';

export interface Institute {
  id: string;
  name: string;
  createdAt?: string;
}

// Module-level cache — shared across component instances
let cache: Institute[] | null = null;

export function useInstitutes(): Institute[] {
  const [institutes, setInstitutes] = useState<Institute[]>(cache ?? PARTNER_INSTITUTES);

  useEffect(() => {
    if (cache) return;
    fetch('/api/institutes')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          cache = data as Institute[];
          setInstitutes(data as Institute[]);
        }
      })
      .catch(() => {
        // Garde la liste par défaut
      });
  }, []);

  return institutes;
}
