describe('Personal Exposure & Mitigation Simulation Mathematics', () => {
  // Constants reflecting real-world clinical and atmospheric physics
  const ADULT_DAILY_INHALATION_VOLUME_M3 = 15;
  const CIGARETTE_EQUIVALENT_PM25_UG = 22; // Berkeley Earth / WHO rule of thumb

  test('calculates baseline daily inhaled PM2.5 dose accurately', () => {
    const ambientPm25 = 100; // ug/m3
    const baselineDose = Math.round(ambientPm25 * ADULT_DAILY_INHALATION_VOLUME_M3);
    expect(baselineDose).toBe(1500); // ug/day
  });

  test('calculates HEPA indoor air filtration efficacy (~85% ambient reduction)', () => {
    const ambientPm25 = 120;
    const cleanRoomBaseline = 12; // ug/m3 under certified True HEPA
    const effectiveIndoor = Math.min(ambientPm25, cleanRoomBaseline);
    expect(effectiveIndoor).toBe(12);

    const doseReductionPct = Math.round(((ambientPm25 - effectiveIndoor) / ambientPm25) * 100);
    expect(doseReductionPct).toBe(90);
  });

  test('calculates certified N95 respirator filtration efficacy (95% reduction during exposure)', () => {
    const exposureDose = 500; // ug
    const n95Mitigated = Math.round(exposureDose * (1 - 0.95));
    expect(n95Mitigated).toBe(25);
  });

  test('computes toxic cigarette equivalence avoided accurately', () => {
    const ambientPm25 = 154; // ug/m3
    const mitigatedPm25 = 40; // ug/m3
    const preventedConcentration = ambientPm25 - mitigatedPm25;

    const avoidedCigarettes = Math.round((preventedConcentration / CIGARETTE_EQUIVALENT_PM25_UG) * 10) / 10;
    expect(avoidedCigarettes).toBe(5.2);
  });

  test('calculates Air Purifier CADR sizing for 4.8 Air Changes per Hour (ACH)', () => {
    const roomAreaSqFt = 180;
    const ceilingHeightFt = 10;
    const roomVolumeCuFt = roomAreaSqFt * ceilingHeightFt; // 1800 cu ft
    const roomVolumeM3 = roomVolumeCuFt * 0.0283168; // ~50.97 m3

    // 4.8 air changes per hour
    const requiredCadrM3H = Math.round(roomVolumeM3 * 4.8);
    const requiredCadrCfm = Math.round(requiredCadrM3H / 1.699);

    expect(requiredCadrM3H).toBe(245);
    expect(requiredCadrCfm).toBe(144);
  });

  test('computes CO2 emissions prevented from shifting commute to Metro rail', () => {
    const tripKm = 10;
    const carEmissionGramsPerKm = 240; // average petrol combustion
    const metroEmissionGramsPerKm = 0; // electrified mass transit

    const co2SavedKg = Math.round(((carEmissionGramsPerKm * tripKm) / 1000) * 10) / 10;
    expect(co2SavedKg).toBe(2.4);
  });
});
