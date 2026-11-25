import {
  AQISummary,
  CityPreset,
  HistoricalDay,
  HistoricalTelemetry,
  HourlyAQIPoint,
} from '@/types';
import { requestJson } from '@/lib/http';
import { calculateIndiaNAQI, computeVentilationWindow, getNAQICategory } from '@/lib/naqi';

export const CITY_PRESETS: CityPreset[] = [
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 },
  { name: 'Gurugram', country: 'India', latitude: 28.4595, longitude: 77.0266 },
  { name: 'Mumbai', country: 'India', latitude: 19.076, longitude: 72.8777 },
  { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Hyderabad', country: 'India', latitude: 17.385, longitude: 78.4867 },
  { name: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Pune', country: 'India', latitude: 18.5204, longitude: 73.8567 },
];

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    pm10: Array<number | null>;
    pm2_5: Array<number | null>;
    carbon_monoxide: Array<number | null>;
    nitrogen_dioxide: Array<number | null>;
    ozone: Array<number | null>;
  };
}

function formatHourLabel(isoTime: string): string {
  const hourStr = isoTime.split('T')[1]?.slice(0, 2) ?? '00';
  const h = parseInt(hourStr, 10);
  if (Number.isNaN(h)) return isoTime;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12.toString().padStart(2, '0')}:00 ${suffix}`;
}

function safeNum(val: number | null | undefined, fallback = 0): number {
  return typeof val === 'number' && !Number.isNaN(val) ? Math.round(val * 10) / 10 : fallback;
}

export async function fetchOpenMeteoAQI(
  latitude: number,
  longitude: number,
  cityName = 'Your Location'
): Promise<AQISummary> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}` +
    `&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone` +
    `&past_days=7&forecast_days=1&timezone=auto`;

  const data = await requestJson<OpenMeteoResponse>(url);
  const times = data.hourly?.time ?? [];

  const allPoints: HourlyAQIPoint[] = times.map((time, idx) => {
    const pm25 = safeNum(data.hourly.pm2_5[idx]);
    const pm10 = safeNum(data.hourly.pm10[idx]);
    const no2 = safeNum(data.hourly.nitrogen_dioxide[idx]);
    const o3 = safeNum(data.hourly.ozone[idx]);
    const co = safeNum(data.hourly.carbon_monoxide[idx]);

    const { naqi, category, color } = calculateIndiaNAQI({
      pm25,
      pm10,
      no2,
      o3,
      coUgM3: co,
    });

    return {
      time,
      hourLabel: formatHourLabel(time),
      pm25,
      pm10,
      no2,
      o3,
      co,
      naqi,
      category,
      color,
    };
  });

  // Separate today's points (last 24 hours) from the past 7 days (preceding 168 hours)
  const todayHourly = allPoints.length >= 24 ? allPoints.slice(-24) : allPoints;
  const pastPoints = allPoints.length >= 24 ? allPoints.slice(0, -24) : [];

  // Group pastPoints by date string "YYYY-MM-DD"
  const dayGroups: Record<string, HourlyAQIPoint[]> = {};
  for (const pt of pastPoints) {
    const dateKey = pt.time.split('T')[0];
    if (!dayGroups[dateKey]) {
      dayGroups[dateKey] = [];
    }
    dayGroups[dateKey].push(pt);
  }

  const historicalDays: HistoricalDay[] = Object.entries(dayGroups).map(([dateStr, points]) => {
    const count = points.length || 1;
    let sumNaqi = 0;
    let maxNaqi = 0;
    let sumPm25 = 0;
    const dominantCounts: Record<string, number> = {};

    for (const p of points) {
      sumNaqi += p.naqi;
      sumPm25 += p.pm25;
      if (p.naqi > maxNaqi) maxNaqi = p.naqi;
      dominantCounts[p.category] = (dominantCounts[p.category] || 0) + 1;
    }

    const avgNaqi = Math.round(sumNaqi / count);
    const avgPm25 = Math.round((sumPm25 / count) * 10) / 10;
    const { category, color } = getNAQICategory(maxNaqi);

    // Approximate daily adult inhalation dose ~ 15 m3 * average PM2.5
    const doseEstimateUg = Math.round(15 * avgPm25);

    const d = new Date(dateStr);
    const dayLabel = d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return {
      date: dateStr,
      dayLabel,
      avgNaqi,
      maxNaqi,
      avgPm25,
      dominant: 'PM2.5',
      category,
      color,
      doseEstimateUg,
    };
  });

  // Weekly stats
  const weeklyAvgNaqi =
    historicalDays.length > 0
      ? Math.round(historicalDays.reduce((acc, d) => acc + d.avgNaqi, 0) / historicalDays.length)
      : todayHourly[0]?.naqi ?? 100;

  const severeDaysCount = historicalDays.filter((d) => d.maxNaqi > 300).length;

  const firstHalfAvg =
    historicalDays.slice(0, 3).reduce((acc, d) => acc + d.avgNaqi, 0) /
    Math.max(1, historicalDays.slice(0, 3).length);
  const secondHalfAvg =
    historicalDays.slice(-3).reduce((acc, d) => acc + d.avgNaqi, 0) /
    Math.max(1, historicalDays.slice(-3).length);

  const diffPct = Math.round(((secondHalfAvg - firstHalfAvg) / Math.max(1, firstHalfAvg)) * 100);
  const trendSummary =
    diffPct > 10
      ? `Particulate levels increased by ${diffPct}% across ${cityName} over the past 3 days compared to last week.`
      : diffPct < -10
      ? `Air quality improved by ${Math.abs(diffPct)}% across ${cityName} over the last 3 days.`
      : `Air quality has remained relatively stable across ${cityName} over the past 7 days (weekly average NAQI ${weeklyAvgNaqi}).`;

  const history: HistoricalTelemetry = {
    days: historicalDays,
    weeklyAvgNaqi,
    severeDaysCount,
    trendSummary,
  };

  // Pick the current hour index from today's hourly
  const nowHour = new Date().getHours();
  const currentPoint = todayHourly[Math.min(nowHour, Math.max(0, todayHourly.length - 1))] ?? {
    pm25: 0,
    pm10: 0,
    no2: 0,
    o3: 0,
    co: 0,
    naqi: 0,
    category: 'Good' as const,
    color: '#10B981',
  };

  const currentCalc = calculateIndiaNAQI({
    pm25: currentPoint.pm25,
    pm10: currentPoint.pm10,
    no2: currentPoint.no2,
    o3: currentPoint.o3,
    coUgM3: currentPoint.co,
  });

  const ventilationWindow = computeVentilationWindow(todayHourly);

  return {
    city: cityName,
    latitude: data.latitude ?? latitude,
    longitude: data.longitude ?? longitude,
    currentNaqi: currentCalc.naqi,
    category: currentCalc.category,
    color: currentCalc.color,
    dominantPollutant: currentCalc.dominantPollutant,
    pm25: currentPoint.pm25,
    pm10: currentPoint.pm10,
    no2: currentPoint.no2,
    o3: currentPoint.o3,
    co: currentPoint.co,
    updatedAt: new Date().toISOString(),
    hourly: todayHourly,
    ventilationWindow,
    history,
  };
}
