import {
  DashboardData,
  WaterTank,
  WaterLevelRecord,
  Alert,
  SupplyUpdate,
  AnalyticsData,
  DemoSettings,
  Community,
} from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchDashboard(tankId?: number): Promise<DashboardData> {
  const url = tankId ? `${API_BASE}/dashboard?tank_id=${tankId}` : `${API_BASE}/dashboard`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchTanks(communityId?: number): Promise<WaterTank[]> {
  const url = communityId ? `${API_BASE}/tanks?community_id=${communityId}` : `${API_BASE}/tanks`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tanks');
  return res.json();
}

export async function fetchTank(tankId: number): Promise<WaterTank> {
  const res = await fetch(`${API_BASE}/tanks/${tankId}`);
  if (!res.ok) throw new Error(`Failed to fetch tank ${tankId}`);
  return res.json();
}

export async function fetchTankHistory(tankId: number, limit: number = 40): Promise<WaterLevelRecord[]> {
  const res = await fetch(`${API_BASE}/tanks/${tankId}/history?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch history for tank ${tankId}`);
  return res.json();
}

export async function updateWaterLevel(tankId: number, levelPct: number): Promise<WaterTank> {
  const res = await fetch(`${API_BASE}/tanks/${tankId}/water-level`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level_pct: levelPct, source: 'MANUAL_SIMULATION' }),
  });
  if (!res.ok) throw new Error('Failed to update water level');
  return res.json();
}

export async function simulateConsumption(tankId: number, stepPct: number = 15.0): Promise<WaterTank> {
  const res = await fetch(`${API_BASE}/tanks/${tankId}/simulate-consumption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step_pct: stepPct }),
  });
  if (!res.ok) throw new Error('Failed to simulate consumption');
  return res.json();
}

export async function simulateRefill(tankId: number, stepPct: number = 25.0): Promise<WaterTank> {
  const res = await fetch(`${API_BASE}/tanks/${tankId}/simulate-refill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step_pct: stepPct }),
  });
  if (!res.ok) throw new Error('Failed to simulate refill');
  return res.json();
}

export async function fetchAlerts(params?: {
  tankId?: number;
  severity?: string;
  unreadOnly?: boolean;
}): Promise<Alert[]> {
  const query = new URLSearchParams();
  if (params?.tankId) query.set('tank_id', params.tankId.toString());
  if (params?.severity && params.severity !== 'all') query.set('severity', params.severity);
  if (params?.unreadOnly) query.set('unread_only', 'true');

  const res = await fetch(`${API_BASE}/alerts?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function markAlertRead(alertId: number): Promise<Alert> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/read`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to mark alert as read');
  return res.json();
}

export async function fetchSupplyUpdates(tankId?: number): Promise<SupplyUpdate[]> {
  const url = tankId ? `${API_BASE}/supply-updates?tank_id=${tankId}` : `${API_BASE}/supply-updates`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch supply updates');
  return res.json();
}

export async function createSupplyUpdate(payload: {
  tank_id: number;
  expected_supply_time: string;
  status: 'Scheduled' | 'Delayed' | 'Completed';
  operator_name: string;
  message_en: string;
  message_te?: string;
}): Promise<SupplyUpdate> {
  const res = await fetch(`${API_BASE}/supply-updates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to publish supply update');
  return res.json();
}

export async function fetchAnalytics(tankId?: number): Promise<AnalyticsData> {
  const url = tankId ? `${API_BASE}/analytics?tank_id=${tankId}` : `${API_BASE}/analytics`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function resetDemo(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}

export async function fetchSettings(): Promise<DemoSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings: Partial<DemoSettings>): Promise<DemoSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function fetchCommunities(): Promise<Community[]> {
  const res = await fetch(`${API_BASE}/communities`);
  if (!res.ok) throw new Error('Failed to fetch communities');
  return res.json();
}

export async function fetchHardwareSpec(): Promise<any> {
  const res = await fetch(`${API_BASE}/hardware-spec`);
  if (!res.ok) throw new Error('Failed to fetch hardware spec');
  return res.json();
}
