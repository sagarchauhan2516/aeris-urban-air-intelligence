import { CITY_PRESETS } from '@/lib/openmeteo';

describe('Open-Meteo & Geographical Config', () => {
  test('CITY_PRESETS contains major Indian urban clusters with valid geographical bounds', () => {
    expect(CITY_PRESETS.length).toBeGreaterThanOrEqual(8);

    for (const preset of CITY_PRESETS) {
      expect(preset.name).toBeTruthy();
      expect(preset.country).toBe('India');
      // India bounds approximately: Lat 8°N to 37°N, Lon 68°E to 98°E
      expect(preset.latitude).toBeGreaterThanOrEqual(8.0);
      expect(preset.latitude).toBeLessThanOrEqual(37.0);
      expect(preset.longitude).toBeGreaterThanOrEqual(68.0);
      expect(preset.longitude).toBeLessThanOrEqual(98.0);
    }
  });

  test('Includes Delhi NCR high-smog baseline stations', () => {
    const names = CITY_PRESETS.map((p) => p.name);
    expect(names).toContain('New Delhi');
    expect(names).toContain('Gurugram');
  });

  test('Preset coordinates match official municipal coordinates', () => {
    const delhi = CITY_PRESETS.find((p) => p.name === 'New Delhi');
    expect(delhi).toBeDefined();
    expect(delhi?.latitude).toBeCloseTo(28.6139, 2);
    expect(delhi?.longitude).toBeCloseTo(77.209, 2);

    const bengaluru = CITY_PRESETS.find((p) => p.name === 'Bengaluru');
    expect(bengaluru).toBeDefined();
    expect(bengaluru?.latitude).toBeCloseTo(12.9716, 2);
    expect(bengaluru?.longitude).toBeCloseTo(77.5946, 2);
  });
});
