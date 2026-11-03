export type WaterStatus = 'Sufficient' | 'Moderate' | 'Low' | 'Critical';
export type AlertSeverity = 'Info' | 'Warning' | 'Critical';
export type AlertType = 'THRESHOLD' | 'SUPPLY_DELAY' | 'SYSTEM';
export type SupplyStatus = 'Scheduled' | 'Delayed' | 'Completed';

export interface Community {
  id: number;
  name: string;
  name_te: string;
  district: string;
  district_te: string;
  state: string;
  total_households: number;
  created_at: string;
}

export interface WaterTank {
  id: number;
  community_id: number;
  name: string;
  name_te: string;
  location: string;
  location_te: string;
  capacity_liters: number;
  current_level_pct: number;
  current_liters: number;
  status: WaterStatus;
  sensor_status: string;
  last_sensor_update: string;
  next_supply_time: string;
  supply_status: SupplyStatus;
  created_at: string;
}

export interface WaterLevelRecord {
  id: number;
  tank_id: number;
  level_pct: number;
  liters: number;
  status: string;
  recorded_at: string;
  source: string;
}

export interface Alert {
  id: number;
  tank_id: number;
  severity: AlertSeverity;
  alert_type: AlertType;
  message_en: string;
  message_te: string;
  is_read: boolean;
  created_at: string;
}

export interface SupplyUpdate {
  id: number;
  tank_id: number;
  expected_supply_time: string;
  status: SupplyStatus;
  operator_name: string;
  message_en: string;
  message_te: string;
  created_at: string;
}

export interface DashboardData {
  community: Community;
  tank: WaterTank;
  current_level_pct: number;
  current_liters: number;
  capacity_liters: number;
  status: WaterStatus;
  sensor_status: string;
  last_sensor_update: string;
  supply_status: SupplyStatus;
  next_supply_time: string;
  latest_operator_message?: SupplyUpdate | null;
  recent_alerts: Alert[];
  level_trend_24h: WaterLevelRecord[];
  daily_availability_summary: {
    average_level_pct: number;
    min_level_pct: number;
    max_level_pct: number;
    hours_above_threshold: number;
    total_records_analyzed: number;
    status_summary: string;
  };
  is_simulation_mode: boolean;
  disclaimer: string;
}

export interface AnalyticsData {
  tank_id: number;
  tank_name: string;
  tank_name_te: string;
  capacity_liters: number;
  current_level_pct: number;
  history: WaterLevelRecord[];
  total_alerts_count: number;
  critical_alerts_count: number;
  warning_alerts_count: number;
  info_alerts_count: number;
  supply_events_count: number;
  average_level_pct: number;
  min_level_pct: number;
  max_level_pct: number;
  availability_trend: string;
  estimated_water_saved_liters: number;
  is_demo_estimate: boolean;
  estimate_explanation: string;
}

export interface DemoSettings {
  id: number;
  active_community_id: number;
  active_tank_id: number;
  sufficient_threshold: number;
  moderate_threshold: number;
  low_threshold: number;
  language: 'en' | 'te';
  updated_at: string;
}
