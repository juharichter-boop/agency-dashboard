export function calculateBillablePercentage(
  billableHours: number,
  totalHours: number
): number {
  if (totalHours === 0) return 0;
  return Math.round((billableHours / totalHours) * 100 * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function getDateRangeLabel(from: Date, to: Date): string {
  const fromStr = from.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const toStr = to.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${fromStr} - ${toStr}`;
}

export function calculateDaysInRange(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function groupByDate<T extends { date: Date | string }>(
  items: T[]
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  for (const item of items) {
    const date = item.date instanceof Date
      ? item.date.toISOString().split('T')[0]
      : item.date;

    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  }

  return grouped;
}

export function calculateAverageDailyMetric(
  metrics: Array<{ value: number; date: Date }>,
  daysInRange: number
): number {
  if (metrics.length === 0) return 0;
  const sum = metrics.reduce((acc, m) => acc + m.value, 0);
  return Math.round((sum / daysInRange) * 100) / 100;
}

export function calculateTrendPercentage(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
}

export function calculateTopN<T extends { count: number }>(
  items: T[],
  n: number
): T[] {
  return items.sort((a, b) => b.count - a.count).slice(0, n);
}

export function getUtilizationRate(
  billableHours: number,
  totalCapacityHours: number
): number {
  if (totalCapacityHours === 0) return 0;
  return Math.min(
    100,
    Math.round((billableHours / totalCapacityHours) * 100)
  );
}

export function calculateCompletionRate(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
