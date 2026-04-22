const FR_DECIMAL = /\s/g;

export function parseFrenchNumber(value: string): number {
  const normalized = value.trim().replace(FR_DECIMAL, '').replace(',', '.');
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return parsed;
}

export function detectDelimiter(line: string): ';' | ',' {
  const semicolons = (line.match(/;/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  return semicolons >= commas ? ';' : ',';
}

export function parseCsvPreview(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSV requires header and at least one row');
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((header) => header.trim());
  const rows = lines.slice(1, 6).map((line) => {
    const values = line.split(delimiter);
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});
  });

  return { headers, rows, delimiter };
}
