describe('API Security & Input Sanitization Layer', () => {
  function sanitizeCoordinates(latStr: unknown, lonStr: unknown) {
    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return { lat, lon };
  }

  function sanitizeCity(raw: unknown, maxLen = 64) {
    if (typeof raw !== 'string') return 'Your Location';
    const cleaned = raw.replace(/[\r\n\t<>]/g, ' ').trim().slice(0, maxLen);
    return cleaned || 'Your Location';
  }

  function sanitizeMembers(raw: unknown) {
    if (!Array.isArray(raw) || raw.length === 0) {
      return [{ id: 'default', name: 'You', ageGroup: 'adult', conditions: ['none'] }];
    }
    const VALID_AGES = ['infant', 'child', 'adult', 'elderly'];
    const VALID_CONDITIONS = ['none', 'asthma', 'heart', 'pregnant', 'copd', 'outdoor_worker'];

    return raw.slice(0, 15).map((item, idx) => {
      const rec = (item && typeof item === 'object' ? item : {}) as any;
      const ageGroup = VALID_AGES.includes(rec.ageGroup) ? rec.ageGroup : 'adult';
      const rawConds = Array.isArray(rec.conditions) ? rec.conditions : ['none'];
      const conditions = rawConds.filter((c: any) => VALID_CONDITIONS.includes(c)).slice(0, 5);

      return {
        id: typeof rec.id === 'string' ? rec.id.slice(0, 32) : `m-${idx}`,
        name: typeof rec.name === 'string' ? rec.name.replace(/[<>]/g, '').slice(0, 32) : `Member ${idx + 1}`,
        ageGroup,
        conditions: conditions.length > 0 ? conditions : ['none'],
      };
    });
  }

  test('rejects out-of-bounds or non-numeric geographic coordinates', () => {
    expect(sanitizeCoordinates('999', '77.2')).toBeNull();
    expect(sanitizeCoordinates('28.6', '-200')).toBeNull();
    expect(sanitizeCoordinates('invalid', '77.2')).toBeNull();
    expect(sanitizeCoordinates(undefined, null)).toBeNull();

    const valid = sanitizeCoordinates('28.6139', '77.2090');
    expect(valid).toEqual({ lat: 28.6139, lon: 77.209 });
  });

  test('sanitizes city names and neutralizes HTML tag injections', () => {
    expect(sanitizeCity('<script>alert("xss")</script>Ahmedabad')).toBe('script alert("xss") /script Ahmedabad');
    expect(sanitizeCity('   New Delhi\r\n\t   ')).toBe('New Delhi');
    expect(sanitizeCity('A'.repeat(200))).toHaveLength(64);
    expect(sanitizeCity(null)).toBe('Your Location');
  });

  test('enforces strict 15-member cap on family arrays to prevent token exhaustion attacks', () => {
    const oversizedArray = Array.from({ length: 30 }, (_, i) => ({
      name: `Person ${i}`,
      ageGroup: 'adult',
      conditions: ['none'],
    }));

    const sanitized = sanitizeMembers(oversizedArray);
    expect(sanitized).toHaveLength(15);
  });

  test('validates age groups and health condition enums', () => {
    const invalidInputs = [
      { name: 'Test', ageGroup: 'super_elderly', conditions: ['alien_virus', 'asthma'] },
    ];
    const sanitized = sanitizeMembers(invalidInputs);
    expect(sanitized[0].ageGroup).toBe('adult'); // fallback to safe default
    expect(sanitized[0].conditions).toEqual(['asthma']); // invalid condition stripped
  });
});
