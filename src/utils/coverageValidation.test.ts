import { describe, expect, it } from 'vitest';

import {
  OPTIONAL_COVER_MAX,
  OPTIONAL_COVER_MIN,
  validateAmountRange
} from './coverageValidation';

describe('validateAmountRange', () => {
  it('returns required error when empty', () => {
    const error = validateAmountRange('', 'Test amount', OPTIONAL_COVER_MIN, OPTIONAL_COVER_MAX);
    expect(error).toBe('Test amount is required');
  });

  it('returns min error when below range', () => {
    const error = validateAmountRange('5000', 'Test amount', OPTIONAL_COVER_MIN, OPTIONAL_COVER_MAX);
    expect(error).toBe(`Test amount must be at least ${OPTIONAL_COVER_MIN}`);
  });

  it('returns max error when above range', () => {
    const error = validateAmountRange('150000', 'Test amount', OPTIONAL_COVER_MIN, OPTIONAL_COVER_MAX);
    expect(error).toBe(`Test amount must not exceed ${OPTIONAL_COVER_MAX}`);
  });

  it('returns null when within range', () => {
    const error = validateAmountRange('25000', 'Test amount', OPTIONAL_COVER_MIN, OPTIONAL_COVER_MAX);
    expect(error).toBeNull();
  });
});
