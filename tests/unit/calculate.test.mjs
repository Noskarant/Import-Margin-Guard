import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRow, calculateScenario } from '../../features/scenarios/lib/calculate.ts';

test('calculateRow computes landed totals', () => {
  const row = calculateRow({
    unitPurchasePrice: 10,
    quantity: 100,
    transportCost: 50,
    dutyRate: 0.1,
    ancillaryFees: 10,
    salesPrice: 15,
  });

  assert.equal(row.landedTotal, 1165);
  assert.equal(Number(row.landedUnit.toFixed(2)), 11.65);
  assert.ok(row.marginPct > 0);
});

test('calculateScenario computes weighted landed unit and margin threshold', () => {
  const summary = calculateScenario([
    { unitPurchasePrice: 10, quantity: 100, transportCost: 50, dutyRate: 0.1, ancillaryFees: 10, salesPrice: 16 },
    { unitPurchasePrice: 9, quantity: 100, transportCost: 40, dutyRate: 0.1, ancillaryFees: 10, salesPrice: 16 },
  ]);

  assert.equal(Number(summary.landedUnitWeighted.toFixed(2)), 11.04);
  assert.ok(typeof summary.marginPct === 'number');
});
