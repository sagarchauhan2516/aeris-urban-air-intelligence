import { NextRequest, NextResponse } from 'next/server';
import { requestJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() ?? '';

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const sanitized = query.replace(/[^\w\s\-,.]/gi, '').slice(0, 48);
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      sanitized
    )}&count=8&language=en&format=json`;

    const data = await requestJson<GeocodingResponse>(url, { timeoutMs: 8000 });
    const results = (data.results ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      state: r.admin1 || '',
      country: r.country || '',
      countryCode: r.country_code || '',
      latitude: r.latitude,
      longitude: r.longitude,
    }));

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      }
    );
  } catch (err) {
    console.error('[/api/geocode] Error:', err);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
