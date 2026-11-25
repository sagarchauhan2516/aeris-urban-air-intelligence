import { HourlyAQIPoint, NAQICategory, VentilationWindow } from '@/types';

interface Breakpoint {
  bLo: number;
  bHi: number;
  iLo: number;
  iHi: number;
}

// Official India CPCB National Air Quality Index (NAQI) Breakpoints
const PM25_BREAKPOINTS: Breakpoint[] = [
  { bLo: 0, bHi: 30, iLo: 0, iHi: 50 },
  { bLo: 30, bHi: 60, iLo: 51, iHi: 100 },
  { bLo: 60, bHi: 90, iLo: 101, iHi: 200 },
  { bLo: 90, bHi: 120, iLo: 201, iHi: 300 },
  { bLo: 120, bHi: 250, iLo: 301, iHi: 400 },
  { bLo: 250, bHi: 500, iLo: 401, iHi: 500 },
];

const PM10_BREAKPOINTS: Breakpoint[] = [
  { bLo: 0, bHi: 50, iLo: 0, iHi: 50 },
  { bLo: 50, bHi: 100, iLo: 51, iHi: 100 },
  { bLo: 100, bHi: 250, iLo: 101, iHi: 200 },
  { bLo: 250, bHi: 350, iLo: 201, iHi: 300 },
  { bLo: 350, bHi: 430, iLo: 301, iHi: 400 },
  { bLo: 430, bHi: 600, iLo: 401, iHi: 500 },
];

const NO2_BREAKPOINTS: Breakpoint[] = [
  { bLo: 0, bHi: 40, iLo: 0, iHi: 50 },
  { bLo: 40, bHi: 80, iLo: 51, iHi: 100 },
  { bLo: 80, bHi: 180, iLo: 101, iHi: 200 },
  { bLo: 180, bHi: 280, iLo: 201, iHi: 300 },
  { bLo: 280, bHi: 400, iLo: 301, iHi: 400 },
  { bLo: 400, bHi: 800, iLo: 401, iHi: 500 },
];

const O3_BREAKPOINTS: Breakpoint[] = [
  { bLo: 0, bHi: 50, iLo: 0, iHi: 50 },
  { bLo: 50, bHi: 100, iLo: 51, iHi: 100 },
  { bLo: 100, bHi: 168, iLo: 101, iHi: 200 },
  { bLo: 168, bHi: 208, iLo: 201, iHi: 300 },
  { bLo: 208, bHi: 748, iLo: 301, iHi: 400 },
  { bLo: 748, bHi: 1000, iLo: 401, iHi: 500 },
];

// CO in mg/m3
const CO_BREAKPOINTS: Breakpoint[] = [
  { bLo: 0, bHi: 1.0, iLo: 0, iHi: 50 },
  { bLo: 1.0, bHi: 2.0, iLo: 51, iHi: 100 },
  { bLo: 2.0, bHi: 10, iLo: 101, iHi: 200 },
  { bLo: 10, bHi: 17, iLo: 201, iHi: 300 },
  { bLo: 17, bHi: 34, iLo: 301, iHi: 400 },
  { bLo: 34, bHi: 50, iLo: 401, iHi: 500 },
];

function computeSubIndex(concentration: number, table: Breakpoint[]): number {
  const c = Math.max(0, concentration);
  for (const bp of table) {
    if (c <= bp.bHi) {
      return ((bp.iHi - bp.iLo) / (bp.bHi - bp.bLo)) * (c - bp.bLo) + bp.iLo;
    }
  }
  return 500;
}

export function getNAQICategory(naqi: number): { category: NAQICategory; color: string } {
  if (naqi <= 50) return { category: 'Good', color: '#10B981' };
  if (naqi <= 100) return { category: 'Satisfactory', color: '#84CC16' };
  if (naqi <= 200) return { category: 'Moderate', color: '#F59E0B' };
  if (naqi <= 300) return { category: 'Poor', color: '#F97316' };
  if (naqi <= 400) return { category: 'Very Poor', color: '#EF4444' };
  return { category: 'Severe', color: '#991B1B' };
}

export interface PollutantInput {
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  coUgM3: number;
}

export function calculateIndiaNAQI(input: PollutantInput): {
  naqi: number;
  category: NAQICategory;
  color: string;
  dominantPollutant: string;
} {
  const coMgM3 = input.coUgM3 / 1000;
  const subIndices: Array<{ name: string; value: number }> = [
    { name: 'PM2.5', value: computeSubIndex(input.pm25, PM25_BREAKPOINTS) },
    { name: 'PM10', value: computeSubIndex(input.pm10, PM10_BREAKPOINTS) },
    { name: 'NO2', value: computeSubIndex(input.no2, NO2_BREAKPOINTS) },
    { name: 'O3', value: computeSubIndex(input.o3, O3_BREAKPOINTS) },
    { name: 'CO', value: computeSubIndex(coMgM3, CO_BREAKPOINTS) },
  ];

  let maxEntry = subIndices[0];
  for (const entry of subIndices) {
    if (entry.value > maxEntry.value) {
      maxEntry = entry;
    }
  }

  const naqi = Math.min(500, Math.max(0, Math.round(maxEntry.value)));
  const { category, color } = getNAQICategory(naqi);

  return {
    naqi,
    category,
    color,
    dominantPollutant: maxEntry.name,
  };
}

/**
 * Finds the best contiguous 2-hour window in the 24-hour forecast
 * with the lowest average NAQI for safe indoor cross-ventilation.
 */
export function computeVentilationWindow(hourly: HourlyAQIPoint[]): VentilationWindow {
  if (hourly.length < 2) {
    return {
      startHour: 'N/A',
      endHour: 'N/A',
      label: 'Insufficient forecast data',
      avgNaqi: 0,
      minNaqi: 0,
      status: 'caution',
      advice: 'Keep windows closed and monitor air quality.',
    };
  }

  let bestIndex = 0;
  let bestAvg = Infinity;

  for (let i = 0; i < hourly.length - 1; i++) {
    const avg = (hourly[i].naqi + hourly[i + 1].naqi) / 2;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestIndex = i;
    }
  }

  const start = hourly[bestIndex];
  const end = hourly[bestIndex + 1];
  const avgNaqi = Math.round(bestAvg);
  const minNaqi = Math.min(start.naqi, end.naqi);

  if (avgNaqi <= 100) {
    return {
      startHour: start.hourLabel,
      endHour: end.hourLabel,
      label: `${start.hourLabel} – ${end.hourLabel}`,
      avgNaqi,
      minNaqi,
      status: 'safe',
      advice: 'Safe to open windows for 30–45 mins to flush indoor CO2 and VOCs.',
    };
  }

  if (avgNaqi <= 200) {
    return {
      startHour: start.hourLabel,
      endHour: end.hourLabel,
      label: `${start.hourLabel} – ${end.hourLabel}`,
      avgNaqi,
      minNaqi,
      status: 'caution',
      advice: 'Brief 10–15 min cross-ventilation only; keep HEPA purifier running afterwards.',
    };
  }

  return {
    startHour: start.hourLabel,
    endHour: end.hourLabel,
    label: `${start.hourLabel} – ${end.hourLabel}`,
    avgNaqi,
    minNaqi,
    status: 'avoid',
    advice: 'Outdoor air remains Poor/Severe all day. Keep windows sealed and run HEPA filtration.',
  };
}
