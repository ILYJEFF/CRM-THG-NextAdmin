export function csvEscape(cell: string): string {
  const s = cell.replace(/\r\n/g, "\n");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsvRow(cells: string[]): string {
  return cells.map(csvEscape).join(",") + "\r\n";
}
