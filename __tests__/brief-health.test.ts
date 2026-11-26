import { buildHealthPrescription, generateGeminiBrief } from '@/lib/gemini';
import { AQISummary, FamilyMember } from '@/types';

const mockAqiSevere: AQISummary = {
  city: 'New Delhi',
  latitude: 28.6139,
  longitude: 77.2090,
  currentNaqi: 340,
  category: 'Very Poor',
  color: '#EF4444',
  dominantPollutant: 'PM2.5',
  pm25: 160.5,
  pm10: 210.0,
  no2: 65.0,
  o3: 35.0,
  co: 1500,
  hourly: [],
  ventilationWindow: {
    bestHourStart: 13,
    label: '01:00 PM – 02:00 PM',
    avgNaqi: 180,
    advice: 'Open windows briefly.',
  },
  updatedAt: new Date().toISOString(),
};

const mockAqiClean: AQISummary = {
  ...mockAqiSevere,
  city: 'Panaji',
  currentNaqi: 45,
  category: 'Good',
  color: '#10B981',
  pm25: 12.0,
};

const mockMembers: FamilyMember[] = [
  { id: 'm1', name: 'Grandfather', ageGroup: 'elderly', conditions: ['copd', 'heart'] },
  { id: 'm2', name: 'Child', ageGroup: 'child', conditions: ['asthma'] },
  { id: 'm3', name: 'Mother', ageGroup: 'adult', conditions: ['pregnant'] },
  { id: 'm4', name: 'Worker', ageGroup: 'adult', conditions: ['outdoor_worker'] },
];

describe('Clinical Health Prescription Engine', () => {
  test('scales daily hydration targets proportionally to air pollution severity', () => {
    const rxSevere = buildHealthPrescription(mockAqiSevere, mockMembers);
    const rxClean = buildHealthPrescription(mockAqiClean, mockMembers);

    expect(rxSevere.hydration.dailyTargetLiters).toBeGreaterThanOrEqual(3.0);
    expect(rxClean.hydration.dailyTargetLiters).toBeLessThan(3.0);
    expect(rxSevere.hydration.tips.length).toBeGreaterThanOrEqual(3);
  });

  test('generates evidence-based antioxidant & anti-inflammatory foods with scientific reasons', () => {
    const rx = buildHealthPrescription(mockAqiSevere, mockMembers);
    const foodNames = rx.nutrition.recommended.map((f) => f.name.toLowerCase());

    expect(foodNames.some((n) => n.includes('jaggery') || n.includes('ginger'))).toBe(true);
    expect(foodNames.some((n) => n.includes('amla') || n.includes('citrus'))).toBe(true);
    expect(foodNames.some((n) => n.includes('turmeric'))).toBe(true);
    expect(foodNames.some((n) => n.includes('flaxseed'))).toBe(true);

    // Each food must have a scientific mechanism
    rx.nutrition.recommended.forEach((f) => {
      expect(f.scientificReason).toBeDefined();
      expect(f.scientificReason.length).toBeGreaterThan(20);
    });
  });

  test('prescribes dietary items to strictly avoid during high smog episodes', () => {
    const rx = buildHealthPrescription(mockAqiSevere, mockMembers);
    expect(rx.nutrition.avoid.length).toBeGreaterThanOrEqual(2);

    const avoidReasons = rx.nutrition.avoid.map((a) => a.reason.toLowerCase());
    expect(avoidReasons.some((r) => r.includes('acrolein') || r.includes('peroxidation') || r.includes('inflammatory'))).toBe(true);
  });

  test('generates condition-specific medical care protocols for high-risk family members', () => {
    const rx = buildHealthPrescription(mockAqiSevere, mockMembers);
    const care = rx.medical.memberSpecific;

    expect(care.length).toBe(mockMembers.length);

    const copdCare = care.find((c) => c.memberName === 'Grandfather');
    expect(copdCare?.condition).toContain('COPD');
    expect(copdCare?.precautions).toContain('SpO2');

    const asthmaCare = care.find((c) => c.memberName === 'Child');
    expect(asthmaCare?.condition).toContain('Asthma');
    expect(asthmaCare?.precautions).toContain('bronchodilator');

    const pregCare = care.find((c) => c.memberName === 'Mother');
    expect(pregCare?.condition).toContain('Pregnancy');
  });

  test('constructs a multi-tier household resilience roadmap across 3 time horizons', () => {
    const rx = buildHealthPrescription(mockAqiSevere, mockMembers);
    const horizons = rx.futureRoadmap.map((r) => r.timeframe);

    expect(horizons).toContain('Immediate (1-7 Days)');
    expect(horizons).toContain('Medium Term (1-3 Months)');
    expect(horizons).toContain('Long Term (Annual)');
  });
});

describe('Gemini AI Brief & Heuristic Fallback Engine', () => {
  test('falls back deterministically to heuristic brief when no API key is provided', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const brief = await generateGeminiBrief(mockAqiSevere, mockMembers);
    expect(brief.source).toBe('heuristic');
    expect(brief.headline).toContain('New Delhi');
    expect(brief.memberRisks.length).toBe(mockMembers.length);
    expect(brief.actionCards.length).toBeGreaterThanOrEqual(2);
    expect(brief.commuteAdvice.options.length).toBe(4);

    process.env.GEMINI_API_KEY = originalKey;
  });

  test('correctly maps risk levels for vulnerable members during Severe air', async () => {
    const brief = await generateGeminiBrief(mockAqiSevere, mockMembers);
    const elderRisk = brief.memberRisks.find((r) => r.name === 'Grandfather');
    expect(['high', 'critical']).toContain(elderRisk?.riskLevel);
  });
});
