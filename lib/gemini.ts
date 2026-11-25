import {
  ActionCard,
  AQISummary,
  CommuteOption,
  FamilyAirBrief,
  FamilyMember,
  HealthPrescription,
  MemberMedicalCare,
  MemberRisk,
  RiskLevel,
} from '@/types';
import { requestJson } from '@/lib/http';

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

function buildCommuteOptions(naqi: number): {
  bestMode: string;
  summary: string;
  options: CommuteOption[];
} {
  const isHighPollution = naqi > 200;
  const isModerate = naqi > 100 && naqi <= 200;

  const options: CommuteOption[] = [
    {
      mode: 'metro',
      label: 'Metro / AC Rail',
      exposureLevel: 'low',
      co2SavedKg: 2.4,
      recommendation: isHighPollution
        ? 'Best choice today: filtered cabin air cuts PM2.5 inhalation by ~65% vs open roads.'
        : 'Lowest personal exposure and zero tailpipe emissions.',
    },
    {
      mode: 'car_recirculate',
      label: 'Car (AC Recirculate)',
      exposureLevel: isHighPollution ? 'medium' : 'low',
      co2SavedKg: 0,
      recommendation:
        'Keep AC on internal recirculation mode to prevent roadside NO2 & PM2.5 intake.',
    },
    {
      mode: 'ev_cab',
      label: 'EV Cab / Shared Auto',
      exposureLevel: isHighPollution ? 'high' : 'medium',
      co2SavedKg: 1.6,
      recommendation: isHighPollution
        ? 'Wear an N95 mask if windows are open in traffic.'
        : 'Good low-carbon option; prefer closed-window EV rides.',
    },
    {
      mode: 'walk_cycle',
      label: 'Walk / Cycle',
      exposureLevel: isHighPollution ? 'high' : isModerate ? 'medium' : 'low',
      co2SavedKg: 3.1,
      recommendation: isHighPollution
        ? 'Avoid heavy exertion outdoors today; breathing rate increases lung particle dose 3–4×.'
        : 'Safe during low-AQI midday windows.',
    },
  ];

  return {
    bestMode: isHighPollution || isModerate ? 'Metro / AC Rail' : 'Walk / Cycle',
    summary: isHighPollution
      ? `At NAQI ${naqi}, sealed AC Metro reduces inhaled PM2.5 dose dramatically while saving 2.4 kg CO2 per 10 km trip.`
      : `At NAQI ${naqi}, active transit or Metro keeps exposure low and cuts household emissions.`,
    options,
  };
}

function computeMemberRisk(member: FamilyMember, aqi: AQISummary): MemberRisk {
  let score = 0;
  if (member.ageGroup === 'infant' || member.ageGroup === 'elderly') {
    score += 1;
  }
  for (const cond of member.conditions) {
    if (cond === 'asthma' || cond === 'copd' || cond === 'heart' || cond === 'pregnant') {
      score += 2;
    } else if (cond === 'outdoor_worker') {
      score += 1;
    }
  }

  const naqi = aqi.currentNaqi;
  let riskLevel: RiskLevel = 'low';

  if (naqi > 300) {
    riskLevel = score >= 2 ? 'critical' : 'high';
  } else if (naqi > 200) {
    if (score >= 3) riskLevel = 'critical';
    else if (score >= 2) riskLevel = 'high';
    else riskLevel = 'medium';
  } else if (naqi > 100) {
    riskLevel = score >= 2 ? 'medium' : 'low';
  } else if (naqi > 80 && score >= 3) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  const condLabel =
    member.conditions.filter((c) => c !== 'none').join(', ') || member.ageGroup;

  const ventLabel = aqi.ventilationWindow?.label || '12:00 PM - 02:00 PM';

  const summaryMap: Record<RiskLevel, string> = {
    critical: `Severe respiratory/cardiac vulnerability (${condLabel}). Continuous indoor air filtration mandatory; strictly avoid outdoor air.`,
    high: `High susceptibility (${condLabel}). Restrict outdoor activity strictly to ${ventLabel}; keep rescue medications immediately accessible.`,
    medium: `Moderate sensitivity (${condLabel}). Avoid prolonged physical exertion during peak smog hours; wear N95 during transit.`,
    low: `Low risk profile (${condLabel}). Normal household routines safe; maintain adequate hydration.`,
  };

  return {
    memberId: member.id,
    name: member.name,
    riskLevel,
    summary: summaryMap[riskLevel],
    safeHours:
      riskLevel === 'critical'
        ? 'Indoor filtered only today'
        : ventLabel,
  };
}

export function buildHealthPrescription(
  aqi: AQISummary,
  members: FamilyMember[]
): HealthPrescription {
  const isSevere = aqi.currentNaqi > 250;
  const isModerate = aqi.currentNaqi > 100;

  const targetLiters = isSevere ? 3.2 : isModerate ? 2.8 : 2.5;

  const memberCare: MemberMedicalCare[] = members.map((m) => {
    const hasAsthma = m.conditions.includes('asthma');
    const hasCopd = m.conditions.includes('copd');
    const hasHeart = m.conditions.includes('heart');
    const isPregnant = m.conditions.includes('pregnant');
    const isOutdoorWorker = m.conditions.includes('outdoor_worker');

    if (hasAsthma) {
      return {
        memberName: m.name,
        condition: 'Asthma / Bronchial Hyperresponsiveness',
        precautions:
          'Keep fast-acting bronchodilator (Salbutamol inhaler with spacer) on nightstand. Take daily controller steroid inhaler as prescribed. Monitor peak expiratory flow.',
        medicationAlert: 'Urgent: Avoid unventilated rooms with incense, dhoop, or kitchen tadka smoke.',
      };
    }
    if (hasCopd) {
      return {
        memberName: m.name,
        condition: 'COPD / Chronic Bronchitis',
        precautions:
          'Monitor SpO2 with a fingertip pulse oximeter twice daily. Strictly avoid stepping out before 10 AM when nocturnal temperature inversion traps ground-level particulates.',
        medicationAlert: 'Consult pulmonologist if resting SpO2 dips below 92% or sputum changes color.',
      };
    }
    if (hasHeart) {
      return {
        memberName: m.name,
        condition: 'Cardiovascular Sensitivity',
        precautions:
          'Check resting blood pressure morning and evening. Inhaled PM2.5 triggers systemic vasoconstriction and elevated cardiac afterload.',
        medicationAlert: 'Avoid strenuous morning exercise; prefer gentle indoor mobility exercises in HEPA-filtered rooms.',
      };
    }
    if (isPregnant) {
      return {
        memberName: m.name,
        condition: 'Pregnancy Protection',
        precautions:
          'Ultrafine particulates can cross the placental barrier. Remain strictly in rooms with continuous HEPA filtration during Poor/Severe days.',
        medicationAlert: 'Keep indoor humidity between 40-50% to prevent mucosal drying and throat irritation.',
      };
    }
    if (m.ageGroup === 'infant') {
      return {
        memberName: m.name,
        condition: 'Infant Developing Respiratory System',
        precautions:
          'Infants breathe 50% more air per kg of body mass than adults. Keep indoor air scrubbed; clean floors with damp microfiber cloth instead of dry broom.',
        medicationAlert: 'Keep indoor air purifier fan speed on Medium/High near the baby crib.',
      };
    }
    if (isOutdoorWorker) {
      return {
        memberName: m.name,
        condition: 'High Occupational Airway Load',
        precautions:
          'Mandatory sealed N95/FFP2 respirator during transit and shift hours. Flush eyes with sterile saline and gargle with warm water every 3 hours.',
        medicationAlert: 'Replace N95 mask once breathing resistance increases or mask becomes damp.',
      };
    }
    return {
      memberName: m.name,
      condition: 'Standard Household Protection',
      precautions:
        'Maintain hydration target; wear N95 respirator if commuting on busy arterial roads.',
      medicationAlert: 'Keep lubricating preservative-free eye drops handy for smog-induced ocular burning.',
    };
  });

  return {
    hydration: {
      dailyTargetLiters: targetLiters,
      protocol: isSevere
        ? 'High smog exacerbates mucosal dryness. Sip warm water every 40-50 minutes. Perform saline nasal rinse after returning indoors.'
        : 'Maintain consistent hydration to support mucociliary clearance of inhaled particulate matter.',
      tips: [
        'Warm salt water gargle (morning and night) clears trapped particulates from the pharynx.',
        'Use preservative-free carboxymethylcellulose (0.5%) eye drops to relieve photochemical smog burning.',
        'Perform 5-minute warm water steam inhalation before sleep to loosen lower-airway secretions.',
      ],
    },
    nutrition: {
      recommended: [
        {
          name: 'Jaggery (Gur) with Crushed Ginger',
          category: 'Airway Clearance',
          benefit: 'Relieves throat tickle & stimulates surfactant',
          scientificReason:
            'Traditional respiratory tonic containing iron and mineral salts that soothes irritated tracheal lining and reduces broncho-spasms.',
        },
        {
          name: 'Amla / Citrus Fruits / Guava',
          category: 'Antioxidant Defense',
          benefit: 'High-dose natural Vitamin C',
          scientificReason:
            'Scavenges reactive oxygen species (ROS) produced when transition metals in PM2.5 oxidize lung epithelial fluid.',
        },
        {
          name: 'Golden Turmeric Milk (with Black Pepper)',
          category: 'Anti-Inflammatory',
          benefit: 'Bioavailable Curcumin with Piperine',
          scientificReason:
            'Downregulates inflammatory cytokines (IL-6, TNF-alpha) and suppresses pulmonary inflammation cascade.',
        },
        {
          name: 'Flaxseeds & Crushed Walnuts',
          category: 'Cardiovascular Support',
          benefit: 'Plant-derived Omega-3 (ALA)',
          scientificReason:
            'Counters systemic endothelial dysfunction and reduces blood platelet hyper-aggregability induced by ultrafine particles.',
        },
        {
          name: 'Tulsi & Licorice (Mulethi) Infusion',
          category: 'Herbal Demulcent',
          benefit: 'Calms cough reflex and coats mucosa',
          scientificReason:
            'Glycyrrhizin in licorice acts as a natural demulcent and expectorant, shielding irritated airway tissues.',
        },
      ],
      avoid: [
        {
          name: 'Deep-Fried Street Food & Re-Heated Oils',
          reason:
            'Heated cooking fats release acrolein vapors and trigger lipid peroxidation, doubling the inflammatory burden on respiratory endothelium.',
        },
        {
          name: 'Excess Chilled / Refrigerated Dairy',
          reason:
            'Cold beverages trigger airway vagal reflexes and increase viscosity of bronchial secretions in smog-irritated airways.',
        },
        {
          name: 'High-Sodium Processed Snacks',
          reason:
            'Fine particulate inhalation triggers acute sympathetic vasoconstriction; high sodium exacerbates blood pressure spikes.',
        },
      ],
    },
    medical: {
      memberSpecific: memberCare,
      generalPrecautions: [
        'Avoid burning incense sticks (agarbatti), mosquito coils, or scented candles indoors — one coil emits PM2.5 equivalent to 75-100 cigarettes.',
        'Ensure kitchen exhaust chimney is running on high speed when sautéing with mustard oil or high-heat spices.',
        'Wipe indoor surfaces with damp microfiber cloths; avoid dry dusting which resuspends settled toxic particulates.',
      ],
    },
    futureRoadmap: [
      {
        timeframe: 'Immediate (1-7 Days)',
        title: 'Home Envelope Sealing & Air Filter Inspection',
        action:
          'Apply silicone or foam weather-stripping to doors and window frames. Vacuum purifier pre-filter screens to maintain optimal CADR air circulation.',
        impact: 'Cuts outdoor toxic particulate infiltration into the home by up to 60%.',
      },
      {
        timeframe: 'Medium Term (1-3 Months)',
        title: 'Indoor Botanical VOC Scrubbers & Carbon Pre-Filters',
        action:
          'Place Areca Palms, Snake Plants (Sansevieria), and Peace Lilies in bedrooms (approx. 3-4 plants per person). Add activated carbon sheets to air filters.',
        impact: 'Absorbs harmful gaseous pollutants (NO2, benzene, formaldehyde) that standard HEPA filters do not capture.',
      },
      {
        timeframe: 'Long Term (Annual)',
        title: 'Commute Decarbonization & Pulmonary Screening',
        action:
          'Transition household school and office commutes to metro / electric transit corridors. Schedule annual spirometry (lung function) checkups for children and seniors.',
        impact: 'Drastically lowers lifetime cumulative biological particulate dose and prevents chronic obstructive lung changes.',
      },
    ],
  };
}

export function buildHeuristicBrief(
  aqi: AQISummary,
  members: FamilyMember[]
): FamilyAirBrief {
  const naqi = aqi.currentNaqi;
  const ventLabel = aqi.ventilationWindow?.label || '12:00 PM - 02:00 PM';
  const ventAdvice =
    aqi.ventilationWindow?.advice ||
    'Keep windows closed during peak traffic hours; open briefly in the afternoon.';
  const ventAvgNaqi = aqi.ventilationWindow?.avgNaqi ?? Math.min(naqi, 150);

  const memberRisks = members.map((m) => computeMemberRisk(m, aqi));

  const actionCards: ActionCard[] = [];

  if (naqi > 200) {
    actionCards.push({
      id: 'outdoor-limit',
      title: 'Pause Outdoor Play & Morning Runs',
      description: `Current ${aqi.dominantPollutant} pushes NAQI to ${naqi} (${aqi.category}). Shift outdoor activity to ${ventLabel} or keep it indoors.`,
      category: 'outdoor',
      priority: 'urgent',
    });
    actionCards.push({
      id: 'hepa-seal',
      title: 'Seal Windows & Run Purifier on Medium/High',
      description: ventAdvice,
      category: 'indoor',
      priority: 'warning',
    });
  } else if (naqi > 100) {
    actionCards.push({
      id: 'window-timing',
      title: `Best Outdoor Window: ${ventLabel}`,
      description: `Air quality dips to NAQI ~${ventAvgNaqi} during this window — ideal for errands and short walks.`,
      category: 'outdoor',
      priority: 'warning',
    });
    actionCards.push({
      id: 'indoor-vent',
      title: 'Timed Cross-Ventilation',
      description: ventAdvice,
      category: 'indoor',
      priority: 'info',
    });
  } else {
    actionCards.push({
      id: 'all-clear',
      title: 'Safe for Outdoor Family Activities',
      description: `NAQI is ${naqi} (${aqi.category}). Great time for parks, cycling, and natural home ventilation.`,
      category: 'outdoor',
      priority: 'info',
    });
  }

  const hasAsthmaOrElderly = members.some(
    (m) =>
      m.ageGroup === 'elderly' ||
      m.ageGroup === 'infant' ||
      m.conditions.includes('asthma') ||
      m.conditions.includes('copd')
  );

  if (hasAsthmaOrElderly && naqi > 100) {
    actionCards.push({
      id: 'vulnerable-care',
      title: 'Protect Sensitive Family Members',
      description:
        'Keep N95 masks near the door, avoid incense/frying smoke indoors, and monitor symptoms closely.',
      category: 'health',
      priority: naqi > 200 ? 'urgent' : 'warning',
    });
  }

  const commuteAdvice = buildCommuteOptions(naqi);
  actionCards.push({
    id: 'commute-tip',
    title: `Recommended Commute: ${commuteAdvice.bestMode}`,
    description: commuteAdvice.summary,
    category: 'commute',
    priority: naqi > 200 ? 'warning' : 'info',
  });

  const headline =
    naqi > 300
      ? `Severe air alert in ${aqi.city} (NAQI ${naqi}) — switch to indoor protection mode today.`
      : naqi > 200
        ? `Poor air in ${aqi.city} (NAQI ${naqi}) — protect sensitive members & time trips carefully.`
        : naqi > 100
          ? `Moderate air in ${aqi.city} (NAQI ${naqi}) — plan outdoor time around ${ventLabel}.`
          : `Clean air in ${aqi.city} (NAQI ${naqi}) — enjoy outdoor routines safely.`;

  const healthPrescription = buildHealthPrescription(aqi, members);

  return {
    source: 'heuristic',
    headline,
    memberRisks,
    actionCards,
    commuteAdvice,
    healthPrescription,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateGeminiBrief(
  aqi: AQISummary,
  members: FamilyMember[]
): Promise<FamilyAirBrief> {
  const rawKey = process.env.GEMINI_API_KEY?.trim();
  const apiKey = rawKey?.replace(/^['"]|['"]$/g, '');
  if (!apiKey) {
    return buildHeuristicBrief(aqi, members);
  }

  const systemInstruction =
    'You are AERIS, a warm, precise urban air quality health advisor for families. ' +
    'Always return valid JSON matching the exact schema requested.';

  const ventLabel = aqi.ventilationWindow?.label || '12:00 PM - 02:00 PM';
  const ventAvgNaqi = aqi.ventilationWindow?.avgNaqi ?? Math.min(aqi.currentNaqi, 150);

  const prompt = `
Analyze the following live air quality telemetry and family household profiles, and generate a personalized daily air routine brief.

City: ${aqi.city}
Current India NAQI: ${aqi.currentNaqi} (${aqi.category})
Dominant Pollutant: ${aqi.dominantPollutant}
Concentrations: PM2.5=${aqi.pm25} ug/m3, PM10=${aqi.pm10} ug/m3, NO2=${aqi.no2} ug/m3, O3=${aqi.o3} ug/m3
Best 2-hour Ventilation Window: ${ventLabel} (avg NAQI ${ventAvgNaqi})

Family Members:
${JSON.stringify(members, null, 2)}

Return ONLY valid JSON with this exact structure:
{
  "headline": "One concise, actionable headline sentence for the family today",
  "memberRisks": [
    {
      "memberId": "matching member id",
      "name": "member name",
      "riskLevel": "low | medium | high | critical",
      "summary": "1-2 sentences tailored to their age and health conditions",
      "safeHours": "e.g. 02:00 PM - 04:00 PM or Indoor only"
    }
  ],
  "actionCards": [
    {
      "id": "unique-slug",
      "title": "Short imperative action title",
      "description": "Specific, practical advice referencing numbers/times",
      "category": "outdoor | indoor | commute | health",
      "priority": "info | warning | urgent"
    }
  ]
}
Generate 3 to 4 actionCards.
`;

  const models = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite'];
  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.35,
    },
  });

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;

      const response = await requestJson<GeminiApiResponse>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
        timeoutMs: 15000,
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const parsed = JSON.parse(text) as {
        headline?: string;
        memberRisks?: MemberRisk[];
        actionCards?: ActionCard[];
      };

      if (!parsed.headline || !Array.isArray(parsed.memberRisks) || !Array.isArray(parsed.actionCards)) {
        continue;
      }

      const validRisks: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
      const validCats = ['outdoor', 'indoor', 'commute', 'health'] as const;
      const validPrios = ['info', 'warning', 'urgent'] as const;

      const normalizedRisks: MemberRisk[] = parsed.memberRisks.map((mr, i) => ({
        memberId: typeof mr.memberId === 'string' ? mr.memberId : members[i]?.id ?? `m-${i}`,
        name: typeof mr.name === 'string' ? mr.name : members[i]?.name ?? `Member ${i + 1}`,
        riskLevel: validRisks.includes(mr.riskLevel) ? mr.riskLevel : 'medium',
        summary: typeof mr.summary === 'string' ? mr.summary : '',
        safeHours: typeof mr.safeHours === 'string' ? mr.safeHours : ventLabel,
      }));

      const normalizedCards: ActionCard[] = parsed.actionCards.slice(0, 6).map((c, i) => ({
        id: typeof c.id === 'string' ? c.id : `card-${i}`,
        title: typeof c.title === 'string' ? c.title : 'Air Quality Action',
        description: typeof c.description === 'string' ? c.description : '',
        category: validCats.includes(c.category) ? c.category : 'health',
        priority: validPrios.includes(c.priority) ? c.priority : 'info',
      }));

      const healthPrescription = buildHealthPrescription(aqi, members);

      return {
        source: 'gemini',
        headline: parsed.headline,
        memberRisks: normalizedRisks,
        actionCards: normalizedCards,
        commuteAdvice: buildCommuteOptions(aqi.currentNaqi),
        healthPrescription,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.includes('429')) {
        // Free tier rate-limit/quota reached: immediately switch to deterministic engine without burning retries
        break;
      }
    }
  }

  return buildHeuristicBrief(aqi, members);
}
