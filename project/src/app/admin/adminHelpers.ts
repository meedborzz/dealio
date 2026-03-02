export const formatMoney = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '—';
  return `${amount.toLocaleString()} DH`;
};

export const formatOptional = (value: any): string => {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
};

export const formatCount = (count: number | null | undefined): string => {
  if (count === null || count === undefined) return '0';
  return count.toString();
};

export const formatRating = (rating: number | null | undefined): string => {
  if (rating === null || rating === undefined || rating === 0) return '—';
  return rating.toFixed(1);
};

export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
};
