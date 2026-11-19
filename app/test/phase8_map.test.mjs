import { test } from 'node:test';
import assert from 'node:assert';
import {
  calculateDistanceKm,
  computeNearestNeighbourRoute,
} from '../src/utils/locationService.ts';

test('phase 8 map: calculateDistanceKm returns 0 for identical coordinates', () => {
  const dist = calculateDistanceKm(26.8467, 80.9462, 26.8467, 80.9462);
  assert.strictEqual(dist, 0);
});

test('phase 8 map: calculateDistanceKm correctly measures distance between villages', () => {
  // Distance between Rampur center (26.8467, 80.9462) and Kishanpur center (26.8430, 80.9415)
  const dist = calculateDistanceKm(26.8467, 80.9462, 26.8430, 80.9415);
  // Straight line distance is approximately 0.61 km
  assert.ok(dist >= 0.5 && dist <= 0.8, `Expected distance ~0.61km, got ${dist}`);
});

test('phase 8 map: computeNearestNeighbourRoute orders stops by shortest hop', () => {
  const start = { lat: 26.8450, lng: 80.9450 }; // Worker position

  const households = [
    {
      id: 'h-far',
      name: 'Far Household',
      geo: { lat: 26.8700, lng: 80.9700 }, // ~3.6 km away
    },
    {
      id: 'h-close',
      name: 'Close Household',
      geo: { lat: 26.8455, lng: 80.9455 }, // ~0.07 km away
    },
    {
      id: 'h-mid',
      name: 'Medium Household',
      geo: { lat: 26.8480, lng: 80.9480 }, // ~0.45 km away
    },
  ];

  const route = computeNearestNeighbourRoute(start, households);

  assert.strictEqual(route.length, 3);
  // Nearest stop first: h-close
  assert.strictEqual(route[0].item.id, 'h-close');
  assert.strictEqual(route[0].stopNumber, 1);
  assert.ok(route[0].distanceFromPreviousKm < 0.2);

  // Next nearest: h-mid
  assert.strictEqual(route[1].item.id, 'h-mid');
  assert.strictEqual(route[1].stopNumber, 2);

  // Furthest stop last: h-far
  assert.strictEqual(route[2].item.id, 'h-far');
  assert.strictEqual(route[2].stopNumber, 3);

  // Cumulative distance increases monotonically
  assert.ok(route[1].totalDistanceKm > route[0].totalDistanceKm);
  assert.ok(route[2].totalDistanceKm > route[1].totalDistanceKm);
});

test('phase 8 map: computeNearestNeighbourRoute safely handles households with null or missing geo', () => {
  const start = { lat: 26.8450, lng: 80.9450 };

  const households = [
    { id: 'h-1', name: 'Valid', geo: { lat: 26.8460, lng: 80.9460 } },
    { id: 'h-2', name: 'No Geo', geo: null },
    { id: 'h-3', name: 'Undefined Geo', geo: undefined },
  ];

  const route = computeNearestNeighbourRoute(start, households);
  assert.strictEqual(route.length, 1);
  assert.strictEqual(route[0].item.id, 'h-1');
});
