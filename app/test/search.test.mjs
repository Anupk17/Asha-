import test from 'node:test';
import assert from 'node:assert';
import Fuse from 'fuse.js';

// Replicate normalize logic for standard Node test
function normalizeHinglish(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ee+/g, 'i')
    .replace(/ea+/g, 'i')
    .replace(/oo+/g, 'u')
    .replace(/ou+/g, 'u')
    .replace(/aa+/g, 'a')
    .replace(/sh+/g, 's')
    .replace(/w+/g, 'v')
    .replace(/ch+/g, 'c')
    .replace(/ph+/g, 'f')
    .replace(/bh+/g, 'b')
    .replace(/dh+/g, 'd')
    .replace(/th+/g, 't')
    .replace(/kh+/g, 'k')
    .replace(/gh+/g, 'g')
    .replace(/(\w)\1+/g, '$1')
    .trim();
}

function searchBeneficiaries(beneficiaries, query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return beneficiaries;

  const prepared = beneficiaries.map((b) => ({
    ...b,
    normalizedName: normalizeHinglish(b.name),
    normalizedVillage: normalizeHinglish(b.village),
  }));

  const fuse = new Fuse(prepared, {
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
  });

  const rawResults = fuse.search(cleanQuery);
  const normResults = fuse.search(normalizeHinglish(cleanQuery));

  const seenIds = new Set();
  const merged = [];

  for (const res of [...rawResults, ...normResults]) {
    if (!seenIds.has(res.item.id)) {
      seenIds.add(res.item.id);
      merged.push(res.item);
    }
  }

  return merged;
}

const sampleBeneficiaries = [
  { id: 'b1', code: 'SYN-0001', name: 'Meena Devi', village: 'Rampur' },
  { id: 'b2', code: 'SYN-0002', name: 'Sunita Sharma', village: 'Rampur' },
  { id: 'b3', code: 'SYN-0003', name: 'Pooja Kumari', village: 'Kishanpur' },
  { id: 'b4', code: 'SYN-0004', name: 'Aarav Singh', village: 'Kishanpur' },
];

test('Hinglish normalizer handles common spelling variants', () => {
  assert.strictEqual(normalizeHinglish('Meena'), normalizeHinglish('Mina'));
  assert.strictEqual(normalizeHinglish('Pooja'), normalizeHinglish('Puja'));
  assert.strictEqual(normalizeHinglish('Sharma'), normalizeHinglish('Sarma'));
  assert.strictEqual(normalizeHinglish('Raampur'), normalizeHinglish('Rampur'));
  assert.strictEqual(normalizeHinglish('Aarav'), normalizeHinglish('Arav'));
});

test('Search finds "Meena Devi" when misspelt as "Mina"', () => {
  const results = searchBeneficiaries(sampleBeneficiaries, 'Mina');
  assert.ok(results.length > 0, 'Found at least one result');
  assert.strictEqual(results[0].code, 'SYN-0001');
  assert.strictEqual(results[0].name, 'Meena Devi');
});

test('Search finds "Pooja Kumari" when misspelt as "Puja"', () => {
  const results = searchBeneficiaries(sampleBeneficiaries, 'Puja');
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].code, 'SYN-0003');
});

test('Search finds by code "SYN-0004"', () => {
  const results = searchBeneficiaries(sampleBeneficiaries, 'SYN-0004');
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].name, 'Aarav Singh');
});

test('Search finds by village "Kishanpur"', () => {
  const results = searchBeneficiaries(sampleBeneficiaries, 'Kishanpur');
  assert.strictEqual(results.length, 2);
});

