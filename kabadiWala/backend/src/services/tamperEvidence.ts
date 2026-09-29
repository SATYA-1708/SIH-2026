import crypto from 'crypto';

export interface HandoverPayload {
  lotReference: string;
  transactionReference: string;
  materialCategory: string;
  verifiedWeightKg: number;
  collectorId: string;
  recyclerId: string;
  gpsCoordinates: string;
  timestamp: string;
  recyclerLicenseNumber: string;
}

export interface TamperEvidentBlock {
  operationId: string;
  previousRecordHash: string;
  currentRecordHash: string;
  canonicalPayload: string;
  digitalSeal: string;
  timestamp: string;
}

/**
 * Creates canonical deterministic JSON string from arbitrary object
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalizeJson).join(',')}]`;
  }
  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map(key => `${JSON.stringify(key)}:${canonicalizeJson(obj[key])}`);
  return `{${entries.join(',')}}`;
}

/**
 * Generates SHA-256 hash for a canonical payload linked to a previous record hash
 */
export function computeRecordHash(payload: HandoverPayload, previousHash: string = 'GENESIS_SEAL_CPCB_2026'): TamperEvidentBlock {
  const canonical = canonicalizeJson(payload);
  const dataToHash = `${previousHash}|${canonical}`;
  
  const currentRecordHash = crypto
    .createHash('sha256')
    .update(dataToHash, 'utf8')
    .digest('hex');

  // Simulated HMAC-SHA256 digital signature representing state environmental node certificate
  const digitalSeal = crypto
    .createHmac('sha256', process.env.AUDIT_SIGNING_KEY || 'ewaste-setu-cpcb-signing-secret-v1')
    .update(currentRecordHash)
    .digest('hex');

  const operationId = `OP-HO-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  return {
    operationId,
    previousRecordHash: previousHash,
    currentRecordHash,
    canonicalPayload: canonical,
    digitalSeal,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates integrity of a record against its payload and prior block
 */
export function verifyBlockIntegrity(
  payload: HandoverPayload,
  previousHash: string,
  claimedCurrentHash: string,
  digitalSeal: string
): { isValid: boolean; reason?: string } {
  const canonical = canonicalizeJson(payload);
  const expectedHash = crypto
    .createHash('sha256')
    .update(`${previousHash}|${canonical}`, 'utf8')
    .digest('hex');

  if (expectedHash !== claimedCurrentHash) {
    return {
      isValid: false,
      reason: 'Hash mismatch: record payload or link to previous block has been altered.',
    };
  }

  const expectedSeal = crypto
    .createHmac('sha256', process.env.AUDIT_SIGNING_KEY || 'ewaste-setu-cpcb-signing-secret-v1')
    .update(expectedHash)
    .digest('hex');

  if (expectedSeal !== digitalSeal) {
    return {
      isValid: false,
      reason: 'Digital signature invalid: record was not signed by an authorized node.',
    };
  }

  return { isValid: true };
}
