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
  assert.equal(summary.currency, 'EUR');
});

test('calculateScenario supports weight-based allocation and FX conversion', () => {
  const summary = calculateScenario(
    [
      {
        unitPurchasePrice: 10,
        quantity: 100,
        transportCost: 0,
        dutyRate: 0.1,
        ancillaryFees: 0,
        currency: 'USD',
        incoterm: 'FOB',
        weightKg: 100,
      },
      {
        unitPurchasePrice: 8,
        quantity: 100,
        transportCost: 0,
        dutyRate: 0.1,
        ancillaryFees: 0,
        currency: 'USD',
        incoterm: 'FOB',
        weightKg: 300,
      },
    ],
    {
      reportingCurrency: 'EUR',
      exchangeRate: 0.9,
      costAllocationMethod: 'by_weight',
      mainFreightCost: 400,
      insuranceCost: 100,
      destinationCost: 60,
    },
  );

  assert.equal(summary.currency, 'EUR');
  assert.equal(summary.allocationMethod, 'by_weight');
  assert.equal(Number(summary.allocatedApproachCostTotal.toFixed(2)), 560);
  assert.equal(Number(summary.landedUnitWeighted.toFixed(2)), 8.81);
});

test('calculateScenario respects DDP by excluding shared approach costs and duties', () => {
  const summary = calculateScenario(
    [
      {
        unitPurchasePrice: 10,
        quantity: 100,
        transportCost: 50,
        dutyRate: 0.1,
        ancillaryFees: 10,
        incoterm: 'DDP',
      },
    ],
    {
      reportingCurrency: 'EUR',
      costAllocationMethod: 'by_quantity',
      originCost: 200,
      mainFreightCost: 300,
      destinationCost: 100,
    },
  );

  assert.equal(summary.dutyTotal, 0);
  assert.equal(summary.allocatedApproachCostTotal, 0);
  assert.equal(Number(summary.landedUnitWeighted.toFixed(2)), 10.6);
});
