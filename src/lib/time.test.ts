import { describe, it, expect } from 'vitest';
import { formatMelbourneShort } from './time';

describe('Time Utils', () => {
  describe('formatMelbourneShort', () => {
    it('formats ISO string correctly in Melbourne time', () => {
      // 2023-01-01 10:00 UTC is 2023-01-01 21:00 AEDT (Melbourne is UTC+11 in Jan)
      const isoString = '2023-01-01T10:00:00Z';
      const result = formatMelbourneShort(isoString);
      expect(result).toBe('01/01/2023 21:00');
    });

    it('formats Date object correctly in Melbourne time', () => {
      const date = new Date('2023-07-01T10:00:00Z');
      // 2023-07-01 10:00 UTC is 2023-07-01 20:00 AEST (Melbourne is UTC+10 in July)
      const result = formatMelbourneShort(date);
      expect(result).toBe('01/07/2023 20:00');
    });
  });
});
