import assert from 'assert';

// Standalone verification of India CPCB NAQI breakpoint math (Node 16+ ESM)
const PM25_BREAKPOINTS = [
  { bLo: 0, bHi: 30, iLo: 0, iHi: 50 },
  { bLo: 30, bHi: 60, iLo: 51, iHi: 100 },
  { bLo: 60, bHi: 90, iLo: 101, iHi: 200 },
  { bLo: 90, bHi: 120, iLo: 201, iHi: 300 },
  { bLo: 120, bHi: 250, iLo: 301, iHi: 400 },
  { bLo: 250, bHi: 500, iLo: 401, iHi: 500 },
];

function computeSubIndex(c, table) {
  const val = Math.max(0, c);
  for (const bp of table) {
    if (val <= bp.bHi) {
      return ((bp.iHi - bp.iLo) / (bp.bHi - bp.bLo)) * (val - bp.bLo) + bp.iLo;
    }
  }
  return 500;
}

assert.strictEqual(Math.round(computeSubIndex(0, PM25_BREAKPOINTS)), 0, 'PM2.5=0 -> NAQI 0');
assert.strictEqual(Math.round(computeSubIndex(30, PM25_BREAKPOINTS)), 50, 'PM2.5=30 -> NAQI 50');
assert.strictEqual(Math.round(computeSubIndex(60, PM25_BREAKPOINTS)), 100, 'PM2.5=60 -> NAQI 100');
assert.strictEqual(Math.round(computeSubIndex(90, PM25_BREAKPOINTS)), 200, 'PM2.5=90 -> NAQI 200');
assert.strictEqual(Math.round(computeSubIndex(600, PM25_BREAKPOINTS)), 500, 'PM2.5=600 -> capped at 500');

console.log('ALL NAQI TESTS PASSED (5/5)');
