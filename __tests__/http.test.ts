import { requestJson } from '@/lib/http';

describe('HTTP & Network Fetch Layer', () => {
  test('rejects with descriptive error when target host is non-existent', async () => {
    await expect(
      requestJson('https://non-existent-aeris-domain-12345.gov/feed', { timeoutMs: 1500 })
    ).rejects.toThrow();
  });

  test('rejects on HTTP error status codes', async () => {
    // Testing invalid path on Open-Meteo API returns an HTTP client error
    await expect(
      requestJson('https://air-quality-api.open-meteo.com/v1/invalid-route-for-testing', {
        timeoutMs: 5000,
      })
    ).rejects.toThrow(/HTTP 400|HTTP 404/);
  });
});
