import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Beneficiary } from '@asha/shared';

/**
 * Normalises Hinglish/Indic transliteration variations so that:
 * - "Mina" matches "Meena"
 * - "Puja" matches "Pooja"
 * - "Sarma" matches "Sharma"
 * - "Raampur" matches "Rampur"
 * - "Aarav" matches "Arav"
 */
export function normalizeHinglish(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    // Common vowel mappings
    .replace(/ee+/g, 'i')
    .replace(/ea+/g, 'i')
    .replace(/oo+/g, 'u')
    .replace(/ou+/g, 'u')
    .replace(/aa+/g, 'a')
    // Common consonant mappings
    .replace(/sh+/g, 's')
    .replace(/w+/g, 'v')
    .replace(/ch+/g, 'c')
    .replace(/ph+/g, 'f')
    .replace(/bh+/g, 'b')
    .replace(/dh+/g, 'd')
    .replace(/th+/g, 't')
    .replace(/kh+/g, 'k')
    .replace(/gh+/g, 'g')
    .replace(/(\w)\1+/g, '$1') // collapse any remaining duplicate consonants
    .trim();
}

export interface SearchableBeneficiary extends Beneficiary {
  normalizedName: string;
  normalizedVillage: string;
}

export function createBeneficiarySearchIndex(beneficiaries: Beneficiary[]): Fuse<SearchableBeneficiary> {
  const prepared: SearchableBeneficiary[] = beneficiaries.map((b) => ({
    ...b,
    normalizedName: normalizeHinglish(b.name),
    normalizedVillage: normalizeHinglish(b.village),
  }));

  const options: IFuseOptions<SearchableBeneficiary> = {
    keys: [
      { name: 'name', weight: 0.35 },
      { name: 'normalizedName', weight: 0.35 },
      { name: 'code', weight: 0.2 },
      { name: 'village', weight: 0.05 },
      { name: 'normalizedVillage', weight: 0.05 },
    ],
    threshold: 0.45,
    distance: 100,
    ignoreLocation: true,
    minMatchCharLength: 2,
  };

  return new Fuse(prepared, options);
}

export function searchBeneficiaries(
  beneficiaries: Beneficiary[],
  query: string
): Beneficiary[] {
  const cleanQuery = query.trim();
  if (!cleanQuery) return beneficiaries;

  const fuse = createBeneficiarySearchIndex(beneficiaries);
  const normalizedQuery = normalizeHinglish(cleanQuery);

  // Search by raw query and normalized query
  const rawResults = fuse.search(cleanQuery);
  const normResults = fuse.search(normalizedQuery);

  // Merge and deduplicate maintaining score order
  const seenIds = new Set<string>();
  const merged: Beneficiary[] = [];

  for (const res of [...rawResults, ...normResults]) {
    if (!seenIds.has(res.item.id)) {
      seenIds.add(res.item.id);
      // Strip helper search fields
      const { normalizedName, normalizedVillage, ...original } = res.item;
      merged.push(original);
    }
  }

  return merged;
}
