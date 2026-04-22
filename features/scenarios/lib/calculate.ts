export type ScenarioInputRow = {
  unitPurchasePrice: number;
  quantity: number;
  transportCost: number;
  dutyRate: number;
  ancillaryFees: number;
  salesPrice?: number;
};

export type ScenarioSummary = {
  landedTotal: number;
  quantityTotal: number;
  landedUnitWeighted: number;
  marginPct?: number;
};

export function calculateRow(row: ScenarioInputRow) {
  if (row.quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }
  if (row.unitPurchasePrice < 0 || row.transportCost < 0 || row.ancillaryFees < 0 || row.dutyRate < 0) {
    throw new Error('Negative values are not supported in MVP');
  }

  const purchaseCost = row.unitPurchasePrice * row.quantity;
  const dutyBase = purchaseCost + row.transportCost;
  const dutyCost = dutyBase * row.dutyRate;
  const landedTotal = purchaseCost + row.transportCost + dutyCost + row.ancillaryFees;
  const landedUnit = landedTotal / row.quantity;

  const marginPct =
    typeof row.salesPrice === 'number' && row.salesPrice > 0
      ? (row.salesPrice - landedUnit) / row.salesPrice
      : undefined;

  return {
    purchaseCost,
    dutyCost,
    landedTotal,
    landedUnit,
    marginPct,
  };
}

export function calculateScenario(rows: ScenarioInputRow[]): ScenarioSummary {
  const computed = rows.map(calculateRow);
  const landedTotal = computed.reduce((acc, row) => acc + row.landedTotal, 0);
  const quantityTotal = rows.reduce((acc, row) => acc + row.quantity, 0);
  const landedUnitWeighted = landedTotal / quantityTotal;

  const margins = computed.map((row) => row.marginPct).filter((value): value is number => typeof value === 'number');
  const marginPct = margins.length >= Math.ceil(rows.length * 0.8) ? margins.reduce((a, b) => a + b, 0) / margins.length : undefined;

  return {
    landedTotal,
    quantityTotal,
    landedUnitWeighted,
    marginPct,
  };
}
