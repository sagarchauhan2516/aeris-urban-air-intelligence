import { calculateIndiaNAQI, computeVentilationWindow, getNAQICategory } from '@/lib/naqi';
import { HourlyAQIPoint } from '@/types';

describe('India CPCB NAQI Calculation Engine', () => {
  test('calculates Good air quality accurately (NAQI <= 50)', () => {
    const result = calculateIndiaNAQI({
      pm25: 15,
      pm10: 25,
      no2: 20,
      o3: 30,
      coUgM3: 500,
    });
    expect(result.naqi).toBeLessThanOrEqual(50);
    expect(result.category).toBe('Good');
    expect(result.color).toBe('#10B981');
  });

  test('calculates Satisfactory air quality (NAQI 51 - 100)', () => {
    const result = calculateIndiaNAQI({
      pm25: 45,
      pm10: 80,
      no2: 60,
      o3: 70,
      coUgM3: 1500,
    });
    expect(result.naqi).toBeGreaterThanOrEqual(51);
    expect(result.naqi).toBeLessThanOrEqual(100);
    expect(result.category).toBe('Satisfactory');
    expect(result.color).toBe('#84CC16');
  });

  test('calculates Moderate air quality (NAQI 101 - 200)', () => {
    const result = calculateIndiaNAQI({
      pm25: 75,
      pm10: 150,
      no2: 120,
      o3: 120,
      coUgM3: 2500,
    });
    expect(result.naqi).toBeGreaterThanOrEqual(101);
    expect(result.naqi).toBeLessThanOrEqual(200);
    expect(result.category).toBe('Moderate');
    expect(result.color).toBe('#F59E0B');
  });

  test('calculates Poor air quality (NAQI 201 - 300)', () => {
    const result = calculateIndiaNAQI({
      pm25: 110,
      pm10: 300,
      no2: 220,
      o3: 180,
      coUgM3: 12000,
    });
    expect(result.naqi).toBeGreaterThanOrEqual(201);
    expect(result.naqi).toBeLessThanOrEqual(300);
    expect(result.category).toBe('Poor');
    expect(result.color).toBe('#F97316');
  });

  test('calculates Very Poor air quality (NAQI 301 - 400)', () => {
    const result = calculateIndiaNAQI({
      pm25: 180,
      pm10: 380,
      no2: 320,
      o3: 250,
      coUgM3: 20000,
    });
    expect(result.naqi).toBeGreaterThanOrEqual(301);
    expect(result.naqi).toBeLessThanOrEqual(400);
    expect(result.category).toBe('Very Poor');
    expect(result.color).toBe('#EF4444');
  });

  test('calculates Severe air quality (NAQI 401 - 500)', () => {
    const result = calculateIndiaNAQI({
      pm25: 350,
      pm10: 550,
      no2: 450,
      o3: 350,
      coUgM3: 35000,
    });
    expect(result.naqi).toBeGreaterThanOrEqual(401);
    expect(result.naqi).toBeLessThanOrEqual(500);
    expect(result.category).toBe('Severe');
    expect(result.color).toBe('#991B1B');
  });

  test('caps NAQI strictly at 500 max', () => {
    const result = calculateIndiaNAQI({
      pm25: 999,
      pm10: 999,
      no2: 999,
      o3: 999,
      coUgM3: 99999,
    });
    expect(result.naqi).toBe(500);
    expect(result.category).toBe('Severe');
  });

  test('identifies dominant pollutant correctly', () => {
    const result = calculateIndiaNAQI({
      pm25: 20,
      pm10: 30,
      no2: 15,
      o3: 210, // Very high ozone
      coUgM3: 500,
    });
    expect(result.dominantPollutant).toBe('O3');
  });

  test('getNAQICategory returns proper category and colors across thresholds', () => {
    expect(getNAQICategory(25).category).toBe('Good');
    expect(getNAQICategory(75).category).toBe('Satisfactory');
    expect(getNAQICategory(150).category).toBe('Moderate');
    expect(getNAQICategory(250).category).toBe('Poor');
    expect(getNAQICategory(350).category).toBe('Very Poor');
    expect(getNAQICategory(450).category).toBe('Severe');
  });
});

describe('Algorithmic Ventilation Window Engine', () => {
  test('correctly pinpoints lowest 2-hour diurnal pollution window', () => {
    const mockHourly: HourlyAQIPoint[] = Array.from({ length: 24 }, (_, i) => ({
      time: `2026-11-26T${String(i).padStart(2, '0')}:00`,
      hourLabel: `${i}:00`,
      pm25: i >= 13 && i <= 14 ? 30 : 150, // Dips at 1:00 PM - 2:00 PM
      pm10: 100,
      no2: 50,
      o3: 30,
      co: 1000,
      naqi: i >= 13 && i <= 14 ? 65 : 280,
      category: i >= 13 && i <= 14 ? 'Satisfactory' : 'Poor',
      color: i >= 13 && i <= 14 ? '#84CC16' : '#F97316',
    }));

    const window = computeVentilationWindow(mockHourly);
    expect(window.startHour).toContain('13:00');
    expect(window.label).toContain('13:00');
    expect(window.avgNaqi).toBe(65);
    expect(window.status).toBe('safe');
  });

  test('handles empty hourly array gracefully without crashing', () => {
    const window = computeVentilationWindow([]);
    expect(window.label).toBe('Insufficient forecast data');
    expect(window.avgNaqi).toBe(0);
    expect(window.status).toBe('caution');
  });
});
