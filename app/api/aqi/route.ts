import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenMeteoAQI } from '@/lib/openmeteo';

export const dynamic = 'force-dynamic';

function sanitizeCity(raw: string | null): string {
  if (!raw) return 'New Delhi';
  const cleaned = raw.replace(/[\r\n\t<>]/g, ' ').trim().slice(0, 64);
  return cleaned || 'New Delhi';
}

export async function GET(request: NextRequest) {
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
