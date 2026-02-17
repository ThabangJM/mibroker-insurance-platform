export const OPTIONAL_COVER_MIN = 10000;
export const OPTIONAL_COVER_MAX = 100000;

export const validateAmountRange = (
  value: string,
  label: string,
  min: number,
  max: number
): string | null => {
  if (!value.trim()) return `${label} is required`;
  const numericValue = parseFloat(value);
  if (Number.isNaN(numericValue)) return `${label} must be a valid number`;
  if (numericValue < min) return `${label} must be at least ${min}`;
  if (numericValue > max) return `${label} must not exceed ${max}`;
  return null;
};
