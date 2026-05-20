import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchBacenRate, fetchCDI, fetchIPCA, getFallbackRate, BACEN_SERIES } from '../../src/services/financeApi';

describe('financeApi services', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('getFallbackRate', () => {
    it('should return 10.50 for CDI series', () => {
      expect(getFallbackRate(BACEN_SERIES.CDI_ANUAL)).toBe(10.50);
      expect(getFallbackRate(BACEN_SERIES.CDI_DIARIO)).toBe(10.50);
      expect(getFallbackRate(BACEN_SERIES.SELIC_META_ANUAL)).toBe(10.50);
    });

    it('should return 4.50 for IPCA 12M series', () => {
      expect(getFallbackRate(BACEN_SERIES.IPCA_12M)).toBe(4.50);
    });

    it('should return 0.35 for IPCA mensal series', () => {
      expect(getFallbackRate(BACEN_SERIES.IPCA_MENSAL)).toBe(0.35);
    });

    it('should return 4.50 for an unknown series ID', () => {
      expect(getFallbackRate(99999)).toBe(4.50);
    });
  });

  describe('fetchBacenRate', () => {
    it('should successfully parse a valid Bacen response with comma decimals', async () => {
      const mockResponse = [
        { data: '18/05/2026', valor: '10,25' }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const rate = await fetchBacenRate(BACEN_SERIES.CDI_ANUAL);
      expect(rate).toBe(10.25);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should successfully parse a valid Bacen response with dot decimals', async () => {
      const mockResponse = [
        { data: '17/05/2026', valor: '10.15' },
        { data: '18/05/2026', valor: '10.50' }
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const rate = await fetchBacenRate(BACEN_SERIES.CDI_ANUAL);
      // It should pick the last element in the array
      expect(rate).toBe(10.50);
    });

    it('should use fallback and log warning when fetch fails (network error)', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const rate = await fetchBacenRate(BACEN_SERIES.CDI_ANUAL);
      expect(rate).toBe(10.50); // Fallback for CDI
      expect(console.warn).toHaveBeenCalled();
    });

    it('should use fallback and log warning when HTTP response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const rate = await fetchBacenRate(BACEN_SERIES.IPCA_12M);
      expect(rate).toBe(4.50); // Fallback for IPCA 12M
      expect(console.warn).toHaveBeenCalled();
    });

    it('should use fallback when response array is empty or malformed', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      const rate = await fetchBacenRate(BACEN_SERIES.IPCA_12M);
      expect(rate).toBe(4.50);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should use fallback when value field is not convertible to float', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ data: '18/05/2026', valor: 'abc' }],
      } as Response);

      const rate = await fetchBacenRate(BACEN_SERIES.CDI_ANUAL);
      expect(rate).toBe(10.50);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('fetchCDI and fetchIPCA helpers', () => {
    it('fetchCDI should fetch with CDI_ANUAL series ID', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ data: '18/05/2026', valor: '10.40' }],
      } as Response);

      const rate = await fetchCDI();
      expect(rate).toBe(10.40);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(String(BACEN_SERIES.CDI_ANUAL)),
        expect.any(Object)
      );
    });

    it('fetchIPCA should fetch with IPCA_12M series ID', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ data: '18/05/2026', valor: '4.35' }],
      } as Response);

      const rate = await fetchIPCA();
      expect(rate).toBe(4.35);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(String(BACEN_SERIES.IPCA_12M)),
        expect.any(Object)
      );
    });
  });
});
