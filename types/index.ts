export type AgeGroup = 'infant' | 'child' | 'adult' | 'elderly';

export type HealthCondition =
  | 'none'
  | 'asthma'
  | 'heart'
  | 'pregnant'
  | 'copd'
  | 'outdoor_worker';

export interface FamilyMember {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  conditions: HealthCondition[];
}

export type NAQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface HourlyAQIPoint {
  time: string;
  hourLabel: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number;
  naqi: number;
  category: NAQICategory;
  color: string;
}

export interface VentilationWindow {
  startHour: string;
  endHour: string;
  label: string;
  avgNaqi: number;
  minNaqi: number;
  status: 'safe' | 'caution' | 'avoid';
  advice: string;
}

export interface HistoricalDay {
  date: string;
  dayLabel: string;
  avgNaqi: number;
  maxNaqi: number;
  avgPm25: number;
  dominant: string;
  category: NAQICategory;
  color: string;
  doseEstimateUg: number;
}

export interface HistoricalTelemetry {
  days: HistoricalDay[];
  weeklyAvgNaqi: number;
  severeDaysCount: number;
  trendSummary: string;
}

export interface AQISummary {
  city: string;
  latitude: number;
  longitude: number;
  currentNaqi: number;
  category: NAQICategory;
  color: string;
  dominantPollutant: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number;
  updatedAt: string;
  hourly: HourlyAQIPoint[];
  ventilationWindow: VentilationWindow;
  history?: HistoricalTelemetry;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface MemberRisk {
  memberId: string;
  name: string;
  riskLevel: RiskLevel;
  summary: string;
  safeHours: string;
}

export interface ActionCard {
  id: string;
  title: string;
  description: string;
  category: 'outdoor' | 'indoor' | 'commute' | 'health';
  priority: 'info' | 'warning' | 'urgent';
}

export interface CommuteOption {
  mode: 'metro' | 'car_recirculate' | 'ev_cab' | 'walk_cycle';
  label: string;
  exposureLevel: 'low' | 'medium' | 'high';
  co2SavedKg: number;
  recommendation: string;
}

export interface FoodItem {
  name: string;
  category: string;
  benefit: string;
  scientificReason: string;
}

export interface FoodAvoid {
  name: string;
  reason: string;
}

export interface MemberMedicalCare {
  memberName: string;
  condition: string;
  precautions: string;
  medicationAlert: string;
}

export interface FutureRoadmapItem {
  timeframe: 'Immediate (1-7 Days)' | 'Medium Term (1-3 Months)' | 'Long Term (Annual)';
  title: string;
  action: string;
  impact: string;
}

export interface HealthPrescription {
  hydration: {
    dailyTargetLiters: number;
    protocol: string;
    tips: string[];
  };
  nutrition: {
    recommended: FoodItem[];
    avoid: FoodAvoid[];
  };
  medical: {
    memberSpecific: MemberMedicalCare[];
    generalPrecautions: string[];
  };
  futureRoadmap: FutureRoadmapItem[];
}

export interface FamilyAirBrief {
  source: 'gemini' | 'heuristic';
  headline: string;
  memberRisks: MemberRisk[];
  actionCards: ActionCard[];
  commuteAdvice: {
    bestMode: string;
    summary: string;
    options: CommuteOption[];
  };
  healthPrescription?: HealthPrescription;
  generatedAt: string;
}

export interface CityPreset {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}
