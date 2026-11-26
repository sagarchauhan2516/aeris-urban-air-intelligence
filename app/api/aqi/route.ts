import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenMeteoAQI } from '@/lib/openmeteo';

export const dynamic = 'force-dynamic';

const aqiRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkAqiRateLimit(ip: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = aqiRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    aqiRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

function sanitizeCity(raw: string | null): string {
  if (!raw) return 'New Delhi';
  const cleaned = raw.replace(/[\r\n\t<>]/g, ' ').trim().slice(0, 64);
  return cleaned || 'New Delhi';
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkAqiRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please retry after a brief pause.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const city = sanitizeCity(searchParams.get('city'));

    const lat = latParam !== null && latParam !== '' ? Number(latParam) : 28.6139;
    const lon = lonParam !== null && lonParam !== '' ? Number(lonParam) : 77.209;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude parameters.' },
        { status: 400 }
      );
    }

    const summary = await fetchOpenMeteoAQI(lat, lon, city);
    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('[/api/aqi] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch air quality telemetry from Open-Meteo.' },
      { status: 502 }
    );
  }
}
