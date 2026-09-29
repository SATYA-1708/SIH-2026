/**
 * Frontend API Client
 */

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('ewaste_token');
}

export function setAuthSession(token: string, user: any) {
  localStorage.setItem('ewaste_token', token);
  localStorage.setItem('ewaste_user', JSON.stringify(user));
}

export function getCurrentUser(): any | null {
  try {
    const raw = localStorage.getItem('ewaste_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem('ewaste_token');
  localStorage.removeItem('ewaste_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  demoLogin: (role: 'collector' | 'recycler' | 'admin') =>
    request<{ user: any; token: string }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  login: (data: { role: string; identifier?: string; name: string; preferredLanguage?: string; location?: string }) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<any>('/auth/me'),

  // Materials
  getMaterials: () => request<any[]>('/materials'),
  getCategories: () => request<string[]>('/materials/categories'),

  // Prices
  getPrices: (location?: string, category?: string) => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (category) params.append('category', category);
    return request<any[]>(`/prices?${params.toString()}`);
  },

  getPriceTrends: (category?: string, location?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (location) params.append('location', location);
    return request<any[]>(`/prices/trends?${params.toString()}`);
  },

  // Recyclers
  getRecyclers: (material?: string) => {
    const params = new URLSearchParams();
    if (material) params.append('material', material);
    return request<any[]>(`/recyclers?${params.toString()}`);
  },

  getRecyclerMatches: (category: string, weight: number, lat?: number, lon?: number) => {
    const params = new URLSearchParams({
      category,
      weight: String(weight),
      ...(lat ? { lat: String(lat) } : {}),
      ...(lon ? { lon: String(lon) } : {}),
    });
    return request<any[]>(`/recyclers/match?${params.toString()}`);
  },

  getRecyclerById: (id: string) => request<any>(`/recyclers/${id}`),

  // Lots
  getLots: (params?: { collectorId?: string; recyclerId?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.collectorId) searchParams.append('collectorId', params.collectorId);
    if (params?.recyclerId) searchParams.append('recyclerId', params.recyclerId);
    if (params?.status) searchParams.append('status', params.status);
    return request<any[]>(`/lots?${searchParams.toString()}`);
  },

  getLotById: (id: string) => request<any>(`/lots/${id}`),

  createLot: (lotData: any) =>
    request<any>('/lots', {
      method: 'POST',
      body: JSON.stringify(lotData),
    }),

  classifyImage: (fileName: string, imageHint?: string, imageBase64?: string) =>
    request<any>('/lots/classify', {
      method: 'POST',
      body: JSON.stringify({ fileName, imageHint, imageBase64 }),
    }),

  // Transactions
  getTransactions: (params?: { collectorId?: string; recyclerId?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.collectorId) searchParams.append('collectorId', params.collectorId);
    if (params?.recyclerId) searchParams.append('recyclerId', params.recyclerId);
    if (params?.status) searchParams.append('status', params.status);
    return request<any[]>(`/transactions?${searchParams.toString()}`);
  },

  getTransactionById: (id: string) => request<any>(`/transactions/${id}`),

  createTransaction: (data: { lotId: string; recyclerId: string; quotedPrice?: number }) =>
    request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTransactionStatus: (id: string, status: string, quotedPrice?: number) =>
    request<any>(`/transactions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, quotedPrice }),
    }),

  confirmHandover: (id: string, data: { finalWeight?: number; handoverLocation?: string; handoverLatitude?: number; handoverLongitude?: number; photo?: string }) =>
    request<any>(`/transactions/${id}/handover`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmPayment: (id: string, data: { paymentMethod?: string; amount?: number }) =>
    request<any>(`/transactions/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Collector
  getCollectorEarnings: (collectorId: string) => request<any>(`/collectors/${collectorId}/earnings`),
  getCollectorTransactions: (collectorId: string) => request<any[]>(`/collectors/${collectorId}/transactions`),
  updateCollectorProfile: (collectorId: string, data: { preferredLanguage?: string; generalOperatingLocation?: string }) =>
    request<any>(`/collectors/${collectorId}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Admin
  getAdminAnalytics: () => request<any>('/admin/analytics'),

  // Verification
  verifyRecord: (reference: string) => request<any>(`/verify/${reference}`),

  // Sync
  syncQueue: (items: any[], collectorId?: string) =>
    request<any>('/sync', {
      method: 'POST',
      body: JSON.stringify({ items, collectorId }),
    }),

  // Trust & Market Intelligence Layer
  evaluateDeal: (data: { materialCategory: string; offeredRate: number; location?: string }) =>
    request<any>('/intelligence/evaluate-quote', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getRecyclerTrustProfile: (recyclerId: string) =>
    request<any>(`/intelligence/recycler-trust/${recyclerId}`),

  getRecoveryYield: (category: string, weight: number) =>
    request<any>(`/intelligence/recovery-yield?category=${encodeURIComponent(category)}&weight=${weight}`),

  getUnitEconomics: () =>
    request<any>('/intelligence/unit-economics'),
};
