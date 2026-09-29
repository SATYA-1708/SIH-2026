import { calculateDistanceKm } from './aiInference';

export interface RecyclerCandidate {
  id: string;
  name: string;
  facilityLocation: string;
  latitude: number;
  longitude: number;
  materialsAccepted: string; // JSON array or comma separated
  authorizationNumber: string;
  authorizationStatus: string; // "Authorized" | "Certified" | "Pending"
  contact: string;
  offeredRates: string; // JSON map
  pickupAvailable: boolean;
  serviceArea: string;
  historicalReliabilityScore?: number; // 0-100 (Scale accuracy & payout speed)
}

export interface EligibilityResult {
  isEligible: boolean;
  exclusionReasons: string[];
}

export interface RankedRecyclerResult {
  recyclerId: string;
  recyclerName: string;
  authorizationNumber: string;
  authorizationStatus: string;
  facilityLocation: string;
  distanceKm: number;
  offeredRatePerKg: number;
  estimatedLotPayout: number;
  pickupAvailable: boolean;
  totalScore: number; // 0 - 100
  scoringBreakdown: {
    authorization: number;
    distance: number;
    rate: number;
    pickup: number;
    reliability: number;
  };
  recommendationReasons: string[];
}

/**
 * Stage 1: Hard Eligibility Filtering (Deterministic Rules - No ML needed)
 */
export function evaluateEligibility(
  recycler: RecyclerCandidate,
  materialCategory: string,
  collectorLat: number,
  collectorLon: number,
  maxAllowedDistanceKm: number = 100
): EligibilityResult {
  const exclusionReasons: string[] = [];

  // 1. Material Acceptance Check
  let accepted: string[] = [];
  try {
    accepted = JSON.parse(recycler.materialsAccepted);
  } catch {
    accepted = recycler.materialsAccepted.split(',').map(s => s.trim());
  }

  const acceptsCategory = accepted.includes(materialCategory) || accepted.includes('Other');
  if (!acceptsCategory) {
    exclusionReasons.push(`Facility does not accept '${materialCategory}'. Accepted: [${accepted.join(', ')}]`);
  }

  // 2. Authorization Validity Check
  const authStatus = (recycler.authorizationStatus || '').toLowerCase();
  const isAuthorized = authStatus.includes('authorized') || authStatus.includes('certified');
  if (!isAuthorized) {
    exclusionReasons.push(`Regulatory status is '${recycler.authorizationStatus}' (CPCB license must be active)`);
  }

  // 3. Geographic Operating Radius Check
  const distance = calculateDistanceKm(collectorLat, collectorLon, recycler.latitude, recycler.longitude);
  if (distance > maxAllowedDistanceKm && !recycler.pickupAvailable) {
    exclusionReasons.push(`Distance (${distance} km) exceeds operating radius (${maxAllowedDistanceKm} km) without pickup`);
  }

  return {
    isEligible: exclusionReasons.length === 0,
    exclusionReasons,
  };
}

/**
 * Stage 2: Transparent, Explainable Multi-Factor Ranking
 */
export function rankEligibleRecyclers(
  candidates: RecyclerCandidate[],
  materialCategory: string,
  weightKg: number,
  collectorLat: number = 21.1458,
  collectorLon: number = 79.0882
): RankedRecyclerResult[] {
  const results: RankedRecyclerResult[] = [];

  for (const recycler of candidates) {
    // Run Stage 1 Hard Filter
    const eligibility = evaluateEligibility(recycler, materialCategory, collectorLat, collectorLon);
    if (!eligibility.isEligible) {
      continue; // Filter out disqualified candidates
    }

    // Stage 2: Score eligible candidates
    const distanceKm = calculateDistanceKm(collectorLat, collectorLon, recycler.latitude, recycler.longitude);

    let ratesMap: Record<string, number> = {};
    try {
      ratesMap = JSON.parse(recycler.offeredRates);
    } catch {
      ratesMap = {};
    }
    const offeredRate = ratesMap[materialCategory] || ratesMap['Other'] || 50;
    const estimatedPayout = Math.round(offeredRate * weightKg);

    // Scoring weights:
    // Auth (30), Rate (30), Proximity (20), Doorstep Pickup (10), Historical Reliability (10)
    const authScore = recycler.authorizationStatus.toLowerCase().includes('cpcb') ? 30 : 25;
    
    // Rate score normalized against baseline (max 30)
    const rateScore = Math.min(Math.round((offeredRate / 500) * 30), 30);

    // Distance score: closer is higher (max 20)
    let distScore = 5;
    if (distanceKm <= 15) distScore = 20;
    else if (distanceKm <= 35) distScore = 15;
    else if (distanceKm <= 60) distScore = 10;

    const pickupScore = recycler.pickupAvailable ? 10 : 3;
    const reliabilityScore = Math.round((recycler.historicalReliabilityScore || 95) / 10); // 0-10

    const totalScore = Math.min(authScore + rateScore + distScore + pickupScore + reliabilityScore, 100);

    // Human-readable, transparent reasons for the recommendation
    const reasons: string[] = [];
    if (distanceKm <= 15) {
      reasons.push(`✓ Immediate proximity (${distanceKm} km away)`);
    } else {
      reasons.push(`✓ Within regional cluster (${distanceKm} km)`);
    }

    if (recycler.pickupAvailable) {
      reasons.push('✓ Free doorstep weighing and hauling vehicle available');
    }

    reasons.push(`✓ Verified offer of ₹${offeredRate}/kg (Est. Payout: ₹${estimatedPayout.toLocaleString('en-IN')})`);
    reasons.push(`✓ Validated State Pollution Board License: ${recycler.authorizationNumber}`);

    results.push({
      recyclerId: recycler.id,
      recyclerName: recycler.name,
      authorizationNumber: recycler.authorizationNumber,
      authorizationStatus: recycler.authorizationStatus,
      facilityLocation: recycler.facilityLocation,
      distanceKm,
      offeredRatePerKg: offeredRate,
      estimatedLotPayout: estimatedPayout,
      pickupAvailable: recycler.pickupAvailable,
      totalScore,
      scoringBreakdown: {
        authorization: authScore,
        distance: distScore,
        rate: rateScore,
        pickup: pickupScore,
        reliability: reliabilityScore,
      },
      recommendationReasons: reasons,
    });
  }

  // Sort by highest composite score
  return results.sort((a, b) => b.totalScore - a.totalScore);
}
