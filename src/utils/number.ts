export function formatNumber(
  amount: number,
  {
    minimumFractionDigits,
    maximumFractionDigits,
  }: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  const minDigits = minimumFractionDigits ?? 3;
  const maxDigits = maximumFractionDigits ?? minDigits;

  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: Math.max(minDigits, maxDigits),
  })}`;
}

export function formatCompactNumber(
  amount: number,
  { minimumFractionDigits = 0, maximumFractionDigits = 2 }: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    })}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    })}K`;
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

export function formatCurrency(
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD',
  minimumFractionDigits = 0
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
  }).format(amount);
}
