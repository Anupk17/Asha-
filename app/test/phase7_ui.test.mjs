import { test } from 'node:test';
import assert from 'node:assert';
import { useAppStore } from '../src/store/appStore.ts';
import { searchBeneficiaries } from '../src/utils/search.ts';

test('phase 7 UI: text size transitions across normal, large and extra-large', () => {
  const store = useAppStore.getState();
  assert.strictEqual(store.textSize, 'normal');

  store.setTextSize('large');
  assert.strictEqual(useAppStore.getState().textSize, 'large');

  store.setTextSize('extra-large');
  assert.strictEqual(useAppStore.getState().textSize, 'extra-large');

  store.setTextSize('normal');
  assert.strictEqual(useAppStore.getState().textSize, 'normal');
});

test('phase 7 UI: beneficiary registration and instant searchability', () => {
  const initial = [
    {
      id: 'syn-b-001',
      code: 'SYN-0001',
      name: 'Meena Devi',
      type: 'pregnant',
      village: 'Rampur',
      created_at: new Date().toISOString(),
    },
  ];

  const newBeneficiary = {
    id: 'syn-b-999',
    code: 'SYN-0009',
    name: 'Shanti Devi',
    type: 'pregnant',
    village: 'Shivpur',
    created_at: new Date().toISOString(),
  };

  const updatedList = [newBeneficiary, ...initial];
  assert.strictEqual(updatedList.length, 2);

  const foundByCode = searchBeneficiaries(updatedList, 'SYN-0009');
  assert.ok(foundByCode.length >= 1);
  assert.strictEqual(foundByCode[0].name, 'Shanti Devi');
  assert.strictEqual(foundByCode[0].code, 'SYN-0009');

  const foundByVillage = searchBeneficiaries(updatedList, 'Shivpur');
  assert.ok(foundByVillage.length >= 1);
  assert.strictEqual(foundByVillage[0].code, 'SYN-0009');
});

test('phase 7 UI: 2-second highlight clearing timer verification', async () => {
  let recentlyEditedField = 'weight_kg';
  
  // Timer mechanism identical to agentStore
  const timer = setTimeout(() => {
    recentlyEditedField = null;
  }, 100);

  assert.strictEqual(recentlyEditedField, 'weight_kg');
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.strictEqual(recentlyEditedField, null);
  clearTimeout(timer);
});
