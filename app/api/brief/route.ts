import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiBrief } from '@/lib/gemini';
import { AgeGroup, AQISummary, FamilyMember, HealthCondition } from '@/types';

interface BriefRequestBody {
  aqi?: AQISummary;
  members?: FamilyMember[];
}

interface CacheEntry {
  brief: any;
  expiresAt: number;
}

const briefCache = new Map<string, CacheEntry>();

const VALID_AGES: AgeGroup[] = ['infant', 'child', 'adult', 'elderly'];
const VALID_CONDITIONS: HealthCondition[] = [
  'none',
  'asthma',
  'heart',
  'pregnant',
  'copd',
  'outdoor_worker',
];

function sanitizeText(value: unknown, maxLen: number, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[\r\n\t<>]/g, ' ').trim().slice(0, maxLen);
  return cleaned || fallback;
}

function sanitizeMembers(raw: unknown): FamilyMember[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ id: 'default-adult', name: 'You', ageGroup: 'adult', conditions: ['none'] }];
  }

  return raw.slice(0, 15).map((item, idx) => {
    const rec = (item && typeof item === 'object' ? item : {}) as Partial<FamilyMember>;
    const ageGroup: AgeGroup = VALID_AGES.includes(rec.ageGroup as AgeGroup)
      ? (rec.ageGroup as AgeGroup)
      : 'adult';

    const rawConds = Array.isArray(rec.conditions) ? rec.conditions : ['none'];
    const conditions = rawConds
      .filter((c): c is HealthCondition => VALID_CONDITIONS.includes(c as HealthCondition))
      .slice(0, 5);

    return {
      id: sanitizeText(rec.id, 32, `member-${idx + 1}`),
      name: sanitizeText(rec.name, 32, `Member ${idx + 1}`),
      ageGroup,
      conditions: conditions.length > 0 ? conditions : ['none'],
    };
  });
}

export async function POST(request: NextRequest) {
  let body: BriefRequestBody;
  try {
    body = (await request.json()) as BriefRequestBody;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON request body.' }, { status: 400 });
  }

  try {
    if (
      !body.aqi ||
      typeof body.aqi.currentNaqi !== 'number' ||
      !Number.isFinite(body.aqi.currentNaqi) ||
      body.aqi.currentNaqi < 0 ||
      body.aqi.currentNaqi > 500
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid AQI summary payload.' },
        { status: 400 }
      );
    }

    const safeAqi: AQISummary = {
      ...body.aqi,
      city: sanitizeText(body.aqi.city, 64, 'Your Location'),
      dominantPollutant: sanitizeText(body.aqi.dominantPollutant, 16, 'PM2.5'),
    };

    const members = sanitizeMembers(body.members);
    const cacheKey = `${safeAqi.city}-${safeAqi.currentNaqi}-${members.map((m) => m.id + ':' + m.conditions.join(',')).join('|')}`;
    const cached = briefCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(cached.brief, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }

    const brief = await generateGeminiBrief(safeAqi, members);
    briefCache.set(cacheKey, { brief, expiresAt: Date.now() + 5 * 60 * 1000 });
    if (briefCache.size > 60) {
      briefCache.clear();
    }
    return NextResponse.json(brief, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('[/api/brief] Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate family air brief.' },
      { status: 500 }
    );
  }
}
