export type CostAllocationMethod = 'manual' | 'by_quantity' | 'by_weight' | 'by_volume' | 'by_value';
export type ScenarioFxRates = Record<string, number>;

export type ScenarioInputRow = {
  unitPurchasePrice: number;
  quantity: number;
  transportCost: number;
  dutyRate: number;
  ancillaryFees: number;
  salesPrice?: number;
  currency?: string;
  incoterm?: string;
  weightKg?: number;
  volumeM3?: number;
};

export type ScenarioCalculationOptions = {
  reportingCurrency?: string;
  exchangeRate?: number;
  exchangeRates?: ScenarioFxRates;
  costAllocationMethod?: CostAllocationMethod;
  incotermOverride?: string;
  originCost?: number;
  mainFreightCost?: number;
  insuranceCost?: number;
  destinationCost?: number;
  marginCoverageThreshold?: number;
};

export type ScenarioSummary = {
  landedTotal: number;
  quantityTotal: number;
  landedUnitWeighted: number;
  marginPct?: number;
  currency: string;
  purchaseTotal: number;
  baseTransportTotal: number;
  ancillaryTotal: number;
  allocatedApproachCostTotal: number;
  dutyTotal: number;
  allocationMethod: CostAllocationMethod;
  incotermMode: 'imported' | 'override';
  marginCoverageThreshold: number;
  marginCoverageRatio: number;
};

type RowComputation = {
  purchaseCost: number;
  baseTransportCost: number;
  ancillaryCost: number;
  allocatedApproachCost: number;
  dutyCost: number;
  landedTotal: number;
  landedUnit: number;
  marginPct?: number;
};

const SUPPLIER_COVERAGE = {
  EXW: { origin: false, freight: false, insurance: false, destination: false, duty: false },
  FCA: { origin: true, freight: false, insurance: false, destination: false, duty: false },
  FOB: { origin: true, freight: false, insurance: false, destination: false, duty: false },
  CIF: { origin: true, freight: true, insurance: true, destination: false, duty: false },
  DDP: { origin: true, freight: true, insurance: true, destination: true, duty: true },
} as const;

function normalizeIncoterm(value?: string) {
  const normalized = String(value ?? 'FOB').trim().toUpperCase();
  return normalized in SUPPLIER_COVERAGE ? (normalized as keyof typeof SUPPLIER_COVERAGE) : 'FOB';
}

function normalizeCurrency(value?: string) {
  const normalized = String(value ?? 'EUR').trim().toUpperCase();
  return normalized || 'EUR';
}

function normalizeFxRates(rates?: ScenarioFxRates) {
  return Object.fromEntries(
    Object.entries(rates ?? {})
      .map(([currency, rate]) => [normalizeCurrency(currency), Number(rate)])
      .filter(([, rate]) => Number.isFinite(rate) && rate > 0),
  ) as ScenarioFxRates;
}

function ensurePositive(name: string, value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a valid non-negative number`);
  }
}

function ensureThreshold(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error('marginCoverageThreshold must be between 0 and 1');
  }
}

function getExchangeRate(
  rowCurrency: string,
  reportingCurrency: string,
  configuredRates: ScenarioFxRates,
  fallbackRate: number,
) {
  if (rowCurrency === reportingCurrency) return 1;
  const configuredRate = configuredRates[rowCurrency];
  if (Number.isFinite(configuredRate) && configuredRate > 0) {
    return configuredRate;
  }
  if (!Number.isFinite(fallbackRate) || fallbackRate <= 0) {
    throw new Error(`Missing FX rate for ${rowCurrency} -> ${reportingCurrency}`);
  }
  return fallbackRate;
}

function getAllocationBasis(
  row: ScenarioInputRow,
  method: CostAllocationMethod,
  exchangeRate: number,
) {
  switch (method) {
    case 'manual':
      return 0;
    case 'by_quantity':
      return row.quantity;
    case 'by_weight':
      return row.weightKg ?? 0;
    case 'by_volume':
      return row.volumeM3 ?? 0;
    case 'by_value':
      return row.unitPurchasePrice * row.quantity * exchangeRate;
    default:
      return row.quantity;
  }
}

function computeApproachCoverage(
  incoterm: keyof typeof SUPPLIER_COVERAGE,
  options: Required<Pick<ScenarioCalculationOptions, 'originCost' | 'mainFreightCost' | 'insuranceCost' | 'destinationCost'>>,
) {
  const coverage = SUPPLIER_COVERAGE[incoterm];
  return {
    origin: coverage.origin ? 0 : options.originCost,
    freight: coverage.freight ? 0 : options.mainFreightCost,
    insurance: coverage.insurance ? 0 : options.insuranceCost,
    destination: coverage.destination ? 0 : options.destinationCost,
    dutyPaidBySupplier: coverage.duty,
  };
}

export function calculateRow(row: ScenarioInputRow) {
  if (row.quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }
  ensurePositive('unitPurchasePrice', row.unitPurchasePrice);
  ensurePositive('transportCost', row.transportCost);
  ensurePositive('ancillaryFees', row.ancillaryFees);
  ensurePositive('dutyRate', row.dutyRate);

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

export function calculateScenario(rows: ScenarioInputRow[], options: ScenarioCalculationOptions = {}): ScenarioSummary {
  if (rows.length === 0) {
    throw new Error('At least one row is required');
  }

  const reportingCurrency = normalizeCurrency(options.reportingCurrency);
  const fallbackExchangeRate = options.exchangeRate ?? 1;
  const exchangeRates = normalizeFxRates(options.exchangeRates);
  const allocationMethod = options.costAllocationMethod ?? 'manual';
  const incotermMode = options.incotermOverride ? 'override' : 'imported';
  const marginCoverageThreshold = options.marginCoverageThreshold ?? 0.8;
  const scenarioCosts = {
    originCost: options.originCost ?? 0,
    mainFreightCost: options.mainFreightCost ?? 0,
    insuranceCost: options.insuranceCost ?? 0,
    destinationCost: options.destinationCost ?? 0,
  };

  ensurePositive('originCost', scenarioCosts.originCost);
  ensurePositive('mainFreightCost', scenarioCosts.mainFreightCost);
  ensurePositive('insuranceCost', scenarioCosts.insuranceCost);
  ensurePositive('destinationCost', scenarioCosts.destinationCost);
  ensureThreshold(marginCoverageThreshold);

  const bases = rows.map((row) => {
    if (row.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    ensurePositive('unitPurchasePrice', row.unitPurchasePrice);
    ensurePositive('transportCost', row.transportCost);
    ensurePositive('ancillaryFees', row.ancillaryFees);
    ensurePositive('dutyRate', row.dutyRate);
    if (typeof row.weightKg === 'number') ensurePositive('weightKg', row.weightKg);
    if (typeof row.volumeM3 === 'number') ensurePositive('volumeM3', row.volumeM3);

    const rowCurrency = normalizeCurrency(row.currency);
    const fxRate = getExchangeRate(rowCurrency, reportingCurrency, exchangeRates, fallbackExchangeRate);
    const effectiveIncoterm = normalizeIncoterm(options.incotermOverride ?? row.incoterm);
    const allocationBasis = getAllocationBasis(row, allocationMethod, fxRate);

    return {
      row,
      fxRate,
      effectiveIncoterm,
      allocationBasis,
    };
  });

  const basisTotal = bases.reduce((acc, item) => acc + item.allocationBasis, 0);

  const computed: RowComputation[] = bases.map(({ row, fxRate, effectiveIncoterm, allocationBasis }) => {
    const purchaseCost = row.unitPurchasePrice * row.quantity * fxRate;
    const baseTransportCost = row.transportCost * fxRate;
    const ancillaryCost = row.ancillaryFees * fxRate;
    const salesPrice = typeof row.salesPrice === 'number' ? row.salesPrice * fxRate : undefined;

    const approachCoverage = computeApproachCoverage(effectiveIncoterm, scenarioCosts);
    const sharedApproachPool =
      approachCoverage.origin + approachCoverage.freight + approachCoverage.insurance + approachCoverage.destination;

    const allocatedApproachCost =
      allocationMethod === 'manual'
        ? 0
        : basisTotal > 0
          ? sharedApproachPool * (allocationBasis / basisTotal)
          : 0;

    const dutyBase = purchaseCost + baseTransportCost + allocatedApproachCost;
    const dutyCost = approachCoverage.dutyPaidBySupplier ? 0 : dutyBase * row.dutyRate;
    const landedTotal = purchaseCost + baseTransportCost + ancillaryCost + allocatedApproachCost + dutyCost;
    const landedUnit = landedTotal / row.quantity;

    const marginPct =
      typeof salesPrice === 'number' && salesPrice > 0
        ? (salesPrice - landedUnit) / salesPrice
        : undefined;

    return {
      purchaseCost,
      baseTransportCost,
      ancillaryCost,
      allocatedApproachCost,
      dutyCost,
      landedTotal,
      landedUnit,
      marginPct,
    };
  });

  const landedTotal = computed.reduce((acc, row) => acc + row.landedTotal, 0);
  const quantityTotal = rows.reduce((acc, row) => acc + row.quantity, 0);
  const landedUnitWeighted = landedTotal / quantityTotal;

  const margins = computed.map((row) => row.marginPct).filter((value): value is number => typeof value === 'number');
  const marginCoverageRatio = rows.length > 0 ? margins.length / rows.length : 0;
  const marginPct = marginCoverageRatio >= marginCoverageThreshold ? margins.reduce((a, b) => a + b, 0) / margins.length : undefined;

  return {
    landedTotal,
    quantityTotal,
    landedUnitWeighted,
    marginPct,
    currency: reportingCurrency,
    purchaseTotal: computed.reduce((acc, row) => acc + row.purchaseCost, 0),
    baseTransportTotal: computed.reduce((acc, row) => acc + row.baseTransportCost, 0),
    ancillaryTotal: computed.reduce((acc, row) => acc + row.ancillaryCost, 0),
    allocatedApproachCostTotal: computed.reduce((acc, row) => acc + row.allocatedApproachCost, 0),
    dutyTotal: computed.reduce((acc, row) => acc + row.dutyCost, 0),
    allocationMethod,
    incotermMode,
    marginCoverageThreshold,
    marginCoverageRatio,
  };
}
