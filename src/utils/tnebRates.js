/**
 * Tamil Nadu Electricity Board (TNEB) Tariff Calculation Utilities
 */

// Old Tariff Slabs (Pre-September 2022)
// For domestic LT-IA consumers, billing is bimonthly.
export function calculateOldTariff(units) {
  let breakdown = [];
  let fixedCharges = 0;
  let totalEnergyCharges = 0;

  if (units <= 0) {
    return {
      total: 0,
      fixedCharges: 0,
      energyCharges: 0,
      breakdown: [{ slab: '0 - 100', units: 0, rate: 0, amount: 0 }]
    };
  }

  // Categories under Old Tariff based on total bimonthly consumption:
  if (units <= 100) {
    // Category 1: Up to 100 units
    breakdown.push({ slab: '0 - 100 (Free)', units: units, rate: 0, amount: 0 });
    fixedCharges = 0;
  } else if (units <= 200) {
    // Category 2: 101 to 200 units
    // 0-100 units: Free
    breakdown.push({ slab: '0 - 100 (Free)', units: 100, rate: 0, amount: 0 });
    
    // 101-200 units: Rs 1.50
    let u2 = units - 100;
    let amt2 = u2 * 1.50;
    breakdown.push({ slab: '101 - 200', units: u2, rate: 1.50, amount: amt2 });
    
    totalEnergyCharges = amt2;
    fixedCharges = 20;
  } else if (units <= 500) {
    // Category 3: 201 to 500 units
    // 0-100 units: Free
    breakdown.push({ slab: '0 - 100 (Free)', units: 100, rate: 0, amount: 0 });
    
    // 101-200 units: Rs 2.00
    let u2 = 100;
    let amt2 = u2 * 2.00;
    breakdown.push({ slab: '101 - 200', units: u2, rate: 2.00, amount: amt2 });
    
    // 201-500 units: Rs 3.00
    let u3 = units - 200;
    let amt3 = u3 * 3.00;
    breakdown.push({ slab: '201 - 500', units: u3, rate: 3.00, amount: amt3 });
    
    totalEnergyCharges = amt2 + amt3;
    fixedCharges = 30;
  } else {
    // Category 4: Above 500 units
    // 0-100 units: Free
    breakdown.push({ slab: '0 - 100 (Free)', units: 100, rate: 0, amount: 0 });
    
    // 101-200 units: Rs 3.50
    let u2 = 100;
    let amt2 = u2 * 3.50;
    breakdown.push({ slab: '101 - 200', units: u2, rate: 3.50, amount: amt2 });
    
    // 201-500 units: Rs 4.60
    let u3 = 300;
    let amt3 = u3 * 4.60;
    breakdown.push({ slab: '201 - 500', units: u3, rate: 4.60, amount: amt3 });
    
    // 501+ units: Rs 6.60
    let u4 = units - 500;
    let amt4 = u4 * 6.60;
    breakdown.push({ slab: 'Above 500', units: u4, rate: 6.60, amount: amt4 });
    
    totalEnergyCharges = amt2 + amt3 + amt4;
    fixedCharges = 50;
  }

  const total = totalEnergyCharges + fixedCharges;

  return {
    total: Math.round(total * 100) / 100,
    fixedCharges,
    energyCharges: Math.round(totalEnergyCharges * 100) / 100,
    breakdown
  };
}

/**
 * Tariff Slab calculation before May 2026 (100 free units scheme)
 * Matches Tneb bill Tariff slabs - 2025(updated)
 */
export function calculateBeforeMay2026Tariff(units) {
  let breakdown = [];
  let totalEnergyCharges = 0;

  if (units <= 0) {
    return {
      total: 0,
      fixedCharges: 0,
      energyCharges: 0,
      breakdown: [{ slab: '0 - 100', units: 0, rate: 0, amount: 0 }]
    };
  }

  let slabs = [];
  if (units <= 500) {
    // Consuming 0 - 500 units
    slabs = [
      { limit: 100, rate: 0, label: '0 - 100 (Free)' },
      { limit: 200, rate: 2.35, label: '101 - 200' },
      { limit: 400, rate: 4.70, label: '201 - 400' },
      { limit: 500, rate: 6.30, label: '401 - 500' }
    ];
  } else {
    // Consuming 500+ units
    slabs = [
      { limit: 100, rate: 0, label: '0 - 100 (Free)' },
      { limit: 400, rate: 4.70, label: '101 - 400' },
      { limit: 500, rate: 6.30, label: '401 - 500' },
      { limit: 600, rate: 8.40, label: '501 - 600' },
      { limit: 800, rate: 9.45, label: '601 - 800' },
      { limit: 1000, rate: 10.50, label: '801 - 1000' },
      { limit: Infinity, rate: 11.55, label: 'Above 1000' }
    ];
  }

  let remainingUnits = units;
  let previousLimit = 0;

  for (const slab of slabs) {
    const slabSpan = slab.limit - previousLimit;
    const unitsInSlab = Math.min(remainingUnits, slabSpan);

    if (unitsInSlab > 0) {
      const amount = unitsInSlab * slab.rate;
      breakdown.push({
        slab: slab.label,
        units: unitsInSlab,
        rate: slab.rate,
        amount: Math.round(amount * 100) / 100
      });
      totalEnergyCharges += amount;
      remainingUnits -= unitsInSlab;
    }

    if (remainingUnits <= 0) break;
    previousLimit = slab.limit;
  }

  return {
    total: Math.round(totalEnergyCharges * 100) / 100,
    fixedCharges: 0,
    energyCharges: Math.round(totalEnergyCharges * 100) / 100,
    breakdown
  };
}

/**
 * Tariff Slab calculation effective from 10 May 2026 (200 free units scheme)
 * Matches Tamil Nadu Electricity Bill - New Tariff (Effective 10 May 2026)
 */
export function calculateAfterMay2026Tariff(units) {
  let breakdown = [];
  let totalEnergyCharges = 0;

  if (units <= 0) {
    return {
      total: 0,
      fixedCharges: 0,
      energyCharges: 0,
      breakdown: [{ slab: '0 - 200', units: 0, rate: 0, amount: 0 }]
    };
  }

  let slabs = [];
  if (units <= 500) {
    // Consuming Upto 500 Unit
    slabs = [
      { limit: 200, rate: 0, label: '0 - 200 (Free)' },
      { limit: 400, rate: 4.70, label: '201 - 400' },
      { limit: 500, rate: 6.30, label: '401 - 500' }
    ];
  } else {
    // Consuming Above 500 Unit
    slabs = [
      { limit: 100, rate: 0, label: '0 - 100 (Free)' },
      { limit: 400, rate: 4.70, label: '101 - 400' },
      { limit: 500, rate: 6.30, label: '401 - 500' },
      { limit: 600, rate: 8.40, label: '501 - 600' },
      { limit: 800, rate: 9.45, label: '601 - 800' },
      { limit: 1000, rate: 10.50, label: '801 - 1000' },
      { limit: Infinity, rate: 11.55, label: 'Above 1000' }
    ];
  }

  let remainingUnits = units;
  let previousLimit = 0;

  for (const slab of slabs) {
    const slabSpan = slab.limit - previousLimit;
    const unitsInSlab = Math.min(remainingUnits, slabSpan);

    if (unitsInSlab > 0) {
      const amount = unitsInSlab * slab.rate;
      breakdown.push({
        slab: slab.label,
        units: unitsInSlab,
        rate: slab.rate,
        amount: Math.round(amount * 100) / 100
      });
      totalEnergyCharges += amount;
      remainingUnits -= unitsInSlab;
    }

    if (remainingUnits <= 0) break;
    previousLimit = slab.limit;
  }

  return {
    total: Math.round(totalEnergyCharges * 100) / 100,
    fixedCharges: 0,
    energyCharges: Math.round(totalEnergyCharges * 100) / 100,
    breakdown
  };
}
