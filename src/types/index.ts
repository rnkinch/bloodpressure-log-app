export interface BloodPressureReading {
  id: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  timestamp: Date;
  notes?: string;
}

export interface BloodPressureStats {
  averageSystolic: number;
  averageDiastolic: number;
  averageHeartRate: number;
  minSystolic: number;
  maxSystolic: number;
  minDiastolic: number;
  maxDiastolic: number;
  totalReadings: number;
  period: string;
}

export interface TrendAnalysis {
  systolicTrend: 'increasing' | 'decreasing' | 'stable';
  diastolicTrend: 'increasing' | 'decreasing' | 'stable';
  heartRateTrend: 'increasing' | 'decreasing' | 'stable';
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
  insights: string[];
}

export interface ChartDataPoint {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  timestamp: number;
}

export interface TimeRangeFilter {
  enabled: boolean;
  startHour: number;
  endHour: number;
  label: string;
}

export interface TimeRangeComparisonData {
  filtered: ChartDataPoint[];
  allData: ChartDataPoint[];
  timeRange: TimeRangeFilter;
  stats: {
    avgSystolic: number;
    avgDiastolic: number;
    avgHeartRate: number;
    readingCount: number;
  };
}