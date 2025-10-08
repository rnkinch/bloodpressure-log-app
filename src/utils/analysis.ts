import { BloodPressureReading, TrendAnalysis, BloodPressureStats, ChartDataPoint, TimeRangeFilter, TimeRangeComparisonData } from '../types';
import { format, subWeeks, subMonths } from 'date-fns';

export const calculateStats = (readings: BloodPressureReading[], period: 'week' | 'month' | 'all' = 'all'): BloodPressureStats => {
  if (readings.length === 0) {
    return {
      averageSystolic: 0,
      averageDiastolic: 0,
      averageHeartRate: 0,
      minSystolic: 0,
      maxSystolic: 0,
      minDiastolic: 0,
      maxDiastolic: 0,
      totalReadings: 0,
      period
    };
  }

  const now = new Date();
  let filteredReadings = readings;

  if (period === 'week') {
    const weekAgo = subWeeks(now, 1);
    filteredReadings = readings.filter(r => r.timestamp >= weekAgo);
  } else if (period === 'month') {
    const monthAgo = subMonths(now, 1);
    filteredReadings = readings.filter(r => r.timestamp >= monthAgo);
  }

  const systolicValues = filteredReadings.map(r => r.systolic);
  const diastolicValues = filteredReadings.map(r => r.diastolic);
  const heartRateValues = filteredReadings.map(r => r.heartRate);

  return {
    averageSystolic: Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length),
    averageDiastolic: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length),
    averageHeartRate: Math.round(heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length),
    minSystolic: Math.min(...systolicValues),
    maxSystolic: Math.max(...systolicValues),
    minDiastolic: Math.min(...diastolicValues),
    maxDiastolic: Math.max(...diastolicValues),
    totalReadings: filteredReadings.length,
    period
  };
};

export const analyzeTrends = (
  readings: BloodPressureReading[], 
  cigarEntries: any[] = [], 
  drinkEntries: any[] = []
): TrendAnalysis => {
  if (readings.length < 2) {
    return {
      systolicTrend: 'stable',
      diastolicTrend: 'stable',
      heartRateTrend: 'stable',
      riskLevel: 'low',
      recommendations: ['Continue monitoring your blood pressure regularly'],
      insights: ['Not enough data for trend analysis. Keep logging readings!']
    };
  }

  // Sort readings by date
  const sortedReadings = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Calculate trends using simple linear regression
  const systolicTrend = calculateTrend(sortedReadings.map(r => r.systolic));
  const diastolicTrend = calculateTrend(sortedReadings.map(r => r.diastolic));
  const heartRateTrend = calculateTrend(sortedReadings.map(r => r.heartRate));

  // Determine risk level based on recent readings
  const recentReadings = sortedReadings.slice(-7); // Last 7 readings
  const avgSystolic = recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length;
  const avgDiastolic = recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length;

  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (avgSystolic >= 140 || avgDiastolic >= 90) {
    riskLevel = 'high';
  } else if (avgSystolic >= 130 || avgDiastolic >= 80) {
    riskLevel = 'moderate';
  }

  const recommendations = generateRecommendations(systolicTrend, diastolicTrend, heartRateTrend, riskLevel, readings, cigarEntries, drinkEntries);
  const insights = generateInsights(systolicTrend, diastolicTrend, heartRateTrend, avgSystolic, avgDiastolic, readings);

  return {
    systolicTrend,
    diastolicTrend,
    heartRateTrend,
    riskLevel,
    recommendations,
    insights
  };
};

const calculateTrend = (values: number[]): 'increasing' | 'decreasing' | 'stable' => {
  if (values.length < 2) return 'stable';
  
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  if (Math.abs(slope) < 0.5) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
};

const generateRecommendations = (
  systolicTrend: string,
  diastolicTrend: string,
  heartRateTrend: string,
  riskLevel: string,
  readings: BloodPressureReading[],
  cigarEntries: any[] = [],
  drinkEntries: any[] = []
): string[] => {
  const recommendations: string[] = [];
  
  if (riskLevel === 'high') {
    recommendations.push('Consider consulting with a healthcare provider about your blood pressure');
    recommendations.push('Monitor your blood pressure more frequently');
  }
  
  if (systolicTrend === 'increasing' || diastolicTrend === 'increasing') {
    recommendations.push('Consider lifestyle changes like reducing sodium intake and increasing exercise');
  }
  
  if (heartRateTrend === 'increasing') {
    recommendations.push('Consider stress management techniques and regular cardiovascular exercise');
  }
  
  if (systolicTrend === 'stable' && diastolicTrend === 'stable') {
    recommendations.push('Great job maintaining stable blood pressure!');
  }

  // Lifestyle-based recommendations
  const lifestyleInsights = generateLifestyleRecommendations(readings, cigarEntries, drinkEntries);
  recommendations.push(...lifestyleInsights);
  
  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring your blood pressure regularly');
  }
  
  return recommendations;
};

const generateInsights = (
  systolicTrend: string,
  diastolicTrend: string,
  heartRateTrend: string,
  avgSystolic: number,
  avgDiastolic: number,
  readings: BloodPressureReading[]
): string[] => {
  const insights: string[] = [];
  
  // Blood pressure category insights
  if (avgSystolic < 120 && avgDiastolic < 80) {
    insights.push('Your blood pressure is in the normal range - excellent!');
  } else if (avgSystolic < 130 && avgDiastolic < 80) {
    insights.push('Your blood pressure is elevated but not in the high range');
  } else if (avgSystolic < 140 && avgDiastolic < 90) {
    insights.push('Your blood pressure is in Stage 1 hypertension range');
  } else {
    insights.push('Your blood pressure is in Stage 2 hypertension range');
  }
  
  // Trend insights
  if (systolicTrend === 'decreasing' && diastolicTrend === 'decreasing') {
    insights.push('Both systolic and diastolic pressures are trending downward - positive progress!');
  } else if (systolicTrend === 'increasing' && diastolicTrend === 'increasing') {
    insights.push('Both pressures are trending upward - consider lifestyle modifications');
  }
  
  if (heartRateTrend === 'decreasing') {
    insights.push('Your heart rate is trending downward, which may indicate improved cardiovascular fitness');
  } else if (heartRateTrend === 'increasing') {
    insights.push('Your heart rate is trending upward - consider stress management and regular exercise');
  }

  // Time-based pattern analysis
  const timePatterns = analyzeTimePatterns(readings);
  insights.push(...timePatterns);
  
  return insights;
};

const generateLifestyleRecommendations = (
  readings: BloodPressureReading[], 
  cigarEntries: any[] = [], 
  drinkEntries: any[] = []
): string[] => {
  const recommendations: string[] = [];
  
  if (readings.length === 0) {
    return recommendations;
  }

  // Analyze lifestyle patterns and correlations
  const lifestyleInsights = analyzeLifestylePatterns(readings, cigarEntries, drinkEntries);
  recommendations.push(...lifestyleInsights);

  return recommendations;
};

const analyzeLifestylePatterns = (
  readings: BloodPressureReading[], 
  cigarEntries: any[], 
  drinkEntries: any[]
): string[] => {
  const insights: string[] = [];
  
  if (cigarEntries.length === 0 && drinkEntries.length === 0) {
    return insights;
  }

  // Analyze cigar patterns
  if (cigarEntries.length > 0) {
    const totalCigars = cigarEntries.reduce((sum, entry) => sum + entry.count, 0);
    const avgCigarsPerDay = totalCigars / cigarEntries.length;
    
    // Find readings on days with cigars
    const cigarDays = new Set(cigarEntries.map(entry => 
      new Date(entry.timestamp).toDateString()
    ));
    const readingsOnCigarDays = readings.filter(reading => 
      cigarDays.has(new Date(reading.timestamp).toDateString())
    );
    
    if (readingsOnCigarDays.length > 0) {
      const avgSystolic = readingsOnCigarDays.reduce((sum, r) => sum + r.systolic, 0) / readingsOnCigarDays.length;
      const avgDiastolic = readingsOnCigarDays.reduce((sum, r) => sum + r.diastolic, 0) / readingsOnCigarDays.length;
      
      if (avgCigarsPerDay >= 3) {
        if (avgSystolic >= 130 || avgDiastolic >= 80) {
          insights.push(`High cigar consumption (${avgCigarsPerDay.toFixed(1)} cigars/day) may be contributing to elevated blood pressure readings (${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg). Consider reducing frequency.`);
        }
      } else if (avgCigarsPerDay >= 1) {
        if (avgSystolic >= 140 || avgDiastolic >= 90) {
          insights.push(`Regular cigar smoking (${avgCigarsPerDay.toFixed(1)} cigars/day) combined with high blood pressure readings suggests monitoring the relationship between smoking and your cardiovascular health.`);
        }
      }
    }
  }

  // Analyze drinking patterns
  if (drinkEntries.length > 0) {
    const totalDrinks = drinkEntries.reduce((sum, entry) => sum + entry.count, 0);
    const avgDrinksPerDay = totalDrinks / drinkEntries.length;
    const avgAlcoholContent = drinkEntries
      .filter(entry => entry.alcoholContent)
      .reduce((sum, entry) => sum + entry.alcoholContent, 0) / 
      drinkEntries.filter(entry => entry.alcoholContent).length || 0;
    
    // Find readings on days with drinks
    const drinkDays = new Set(drinkEntries.map(entry => 
      new Date(entry.timestamp).toDateString()
    ));
    const readingsOnDrinkDays = readings.filter(reading => 
      drinkDays.has(new Date(reading.timestamp).toDateString())
    );
    
    if (readingsOnDrinkDays.length > 0) {
      const avgSystolic = readingsOnDrinkDays.reduce((sum, r) => sum + r.systolic, 0) / readingsOnDrinkDays.length;
      const avgDiastolic = readingsOnDrinkDays.reduce((sum, r) => sum + r.diastolic, 0) / readingsOnDrinkDays.length;
      
      if (avgDrinksPerDay >= 4) {
        if (avgSystolic >= 130 || avgDiastolic >= 80) {
          insights.push(`High alcohol consumption (${avgDrinksPerDay.toFixed(1)} drinks/day) may be contributing to elevated blood pressure readings (${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg). Consider reducing intake.`);
        }
      } else if (avgDrinksPerDay >= 2) {
        if (avgSystolic >= 140 || avgDiastolic >= 90) {
          insights.push(`Regular alcohol consumption (${avgDrinksPerDay.toFixed(1)} drinks/day) with high blood pressure readings suggests monitoring the relationship between drinking and your cardiovascular health.`);
        }
      }

      // High alcohol content analysis
      if (avgAlcoholContent >= 15 && (avgSystolic >= 130 || avgDiastolic >= 80)) {
        insights.push(`High-alcohol content drinks (${avgAlcoholContent.toFixed(1)}% ABV average) may be contributing to elevated blood pressure. Consider switching to lower-alcohol alternatives.`);
      }
    }
  }

  // Combined lifestyle analysis
  const combinedDays = new Set([
    ...cigarEntries.map(entry => new Date(entry.timestamp).toDateString()),
    ...drinkEntries.map(entry => new Date(entry.timestamp).toDateString())
  ]);
  
  const readingsOnLifestyleDays = readings.filter(reading => 
    combinedDays.has(new Date(reading.timestamp).toDateString())
  );
  
  if (readingsOnLifestyleDays.length > 0) {
    const avgSystolic = readingsOnLifestyleDays.reduce((sum, r) => sum + r.systolic, 0) / readingsOnLifestyleDays.length;
    const avgDiastolic = readingsOnLifestyleDays.reduce((sum, r) => sum + r.diastolic, 0) / readingsOnLifestyleDays.length;
    
    if (avgSystolic >= 130 || avgDiastolic >= 80) {
      insights.push('Days with lifestyle activities (smoking/drinking) show elevated blood pressure readings. Consider the cumulative effects of these activities on your cardiovascular health.');
    }
  }

  return insights;
};

const analyzeLifestyleTiming = (readings: BloodPressureReading[]): string[] => {
  const insights: string[] = [];
  
  // Note: Lifestyle timing analysis will be handled separately since we now have independent lifestyle tracking
  // This function is kept for future integration with lifestyle data
  
  return insights;
};

export const prepareChartData = (
  readings: BloodPressureReading[], 
  cigarEntries: any[] = [], 
  drinkEntries: any[] = []
): ChartDataPoint[] => {
  return readings
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map(reading => {
      // Convert to local timezone for display
      const localDate = new Date(reading.timestamp.getTime() - reading.timestamp.getTimezoneOffset() * 60000);
      
      // Find lifestyle activities on the same day
      const readingDate = new Date(reading.timestamp);
      const sameDayCigars = cigarEntries.filter(entry => 
        new Date(entry.timestamp).toDateString() === readingDate.toDateString()
      );
      const sameDayDrinks = drinkEntries.filter(entry => 
        new Date(entry.timestamp).toDateString() === readingDate.toDateString()
      );
      
      const totalCigars = sameDayCigars.reduce((sum, entry) => sum + entry.count, 0);
      const totalDrinks = sameDayDrinks.reduce((sum, entry) => sum + entry.count, 0);
      const avgAlcoholContent = sameDayDrinks.length > 0 
        ? sameDayDrinks.reduce((sum, entry) => sum + (entry.alcoholContent || 0), 0) / sameDayDrinks.length 
        : 0;

      return {
        date: format(localDate, 'MMM dd'),
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        heartRate: reading.heartRate,
        timestamp: reading.timestamp.getTime(),
        lifestyle: (totalCigars > 0 || totalDrinks > 0) ? {
          cigars: totalCigars,
          drinks: totalDrinks,
          alcoholContent: avgAlcoholContent
        } : undefined
      };
    });
};

export const filterReadingsByTimeRange = (
  readings: BloodPressureReading[], 
  timeRange: TimeRangeFilter
): BloodPressureReading[] => {
  if (!timeRange.enabled) {
    return readings;
  }

  return readings.filter(reading => {
    const hour = reading.timestamp.getHours();
    const minute = reading.timestamp.getMinutes();
    const readingTime = hour + minute / 60;
    const startTime = timeRange.startHour;
    const endTime = timeRange.endHour;

    // Handle time ranges that cross midnight (e.g., 22:00-06:00)
    if (startTime > endTime) {
      return readingTime >= startTime || readingTime <= endTime;
    }
    
    return readingTime >= startTime && readingTime <= endTime;
  });
};

export const prepareTimeRangeComparisonData = (
  readings: BloodPressureReading[],
  timeRange: TimeRangeFilter,
  period: 'week' | 'month' | 'all' = 'all'
): TimeRangeComparisonData => {
  const now = new Date();
  let filteredReadings = readings;
  
  // First apply period filter
  if (period === 'week') {
    const weekAgo = subWeeks(now, 1);
    filteredReadings = readings.filter(r => r.timestamp >= weekAgo);
  } else if (period === 'month') {
    const monthAgo = subMonths(now, 1);
    filteredReadings = readings.filter(r => r.timestamp >= monthAgo);
  }

  // Then apply time range filter
  const timeFilteredReadings = filterReadingsByTimeRange(filteredReadings, timeRange);
  
  // Prepare chart data
  const allData = prepareChartData(filteredReadings);
  const filteredData = prepareChartData(timeFilteredReadings);

  // Calculate stats for filtered data
  let stats = {
    avgSystolic: 0,
    avgDiastolic: 0,
    avgHeartRate: 0,
    readingCount: 0
  };

  if (timeFilteredReadings.length > 0) {
    const systolicSum = timeFilteredReadings.reduce((sum, r) => sum + r.systolic, 0);
    const diastolicSum = timeFilteredReadings.reduce((sum, r) => sum + r.diastolic, 0);
    const heartRateSum = timeFilteredReadings.reduce((sum, r) => sum + r.heartRate, 0);
    
    stats = {
      avgSystolic: Math.round(systolicSum / timeFilteredReadings.length),
      avgDiastolic: Math.round(diastolicSum / timeFilteredReadings.length),
      avgHeartRate: Math.round(heartRateSum / timeFilteredReadings.length),
      readingCount: timeFilteredReadings.length
    };
  }

  return {
    filtered: filteredData,
    allData: allData,
    timeRange: timeRange,
    stats: stats
  };
};

export const getPresetTimeRanges = (): TimeRangeFilter[] => {
  return [
    { enabled: false, startHour: 6, endHour: 10, label: 'Morning (6 AM - 10 AM)' },
    { enabled: false, startHour: 10, endHour: 14, label: 'Late Morning (10 AM - 2 PM)' },
    { enabled: false, startHour: 14, endHour: 18, label: 'Afternoon (2 PM - 6 PM)' },
    { enabled: false, startHour: 18, endHour: 22, label: 'Evening (6 PM - 10 PM)' },
    { enabled: false, startHour: 22, endHour: 6, label: 'Night (10 PM - 6 AM)' },
    { enabled: false, startHour: 0, endHour: 6, label: 'Early Morning (12 AM - 6 AM)' },
    { enabled: false, startHour: 6, endHour: 12, label: 'Morning Hours (6 AM - 12 PM)' },
    { enabled: false, startHour: 12, endHour: 18, label: 'Afternoon Hours (12 PM - 6 PM)' },
    { enabled: false, startHour: 18, endHour: 24, label: 'Evening Hours (6 PM - 12 AM)' }
  ];
};

const analyzeTimePatterns = (readings: BloodPressureReading[]): string[] => {
  const insights: string[] = [];
  
  if (readings.length < 4) {
    return insights; // Need at least 4 readings to detect patterns
  }

  // Group readings by time periods
  const timePeriods = {
    morning: readings.filter(r => r.timestamp.getHours() >= 6 && r.timestamp.getHours() < 12),
    afternoon: readings.filter(r => r.timestamp.getHours() >= 12 && r.timestamp.getHours() < 18),
    evening: readings.filter(r => r.timestamp.getHours() >= 18 && r.timestamp.getHours() < 24),
    night: readings.filter(r => r.timestamp.getHours() >= 0 && r.timestamp.getHours() < 6)
  };

  // Calculate averages for each time period
  const periodAverages = Object.entries(timePeriods)
    .map(([period, readings]) => {
      if (readings.length === 0) return null;
      
      const avgSystolic = readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length;
      const avgDiastolic = readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length;
      
      return {
        period,
        avgSystolic: Math.round(avgSystolic),
        avgDiastolic: Math.round(avgDiastolic),
        count: readings.length
      };
    })
    .filter((period): period is NonNullable<typeof period> => period !== null);

  if (periodAverages.length < 2) {
    return insights;
  }

  // Find highest and lowest periods
  const highestSystolic = periodAverages.reduce((max, current) => 
    current.avgSystolic > max.avgSystolic ? current : max
  );
  const lowestSystolic = periodAverages.reduce((min, current) => 
    current.avgSystolic < min.avgSystolic ? current : min
  );

  const highestDiastolic = periodAverages.reduce((max, current) => 
    current.avgDiastolic > max.avgDiastolic ? current : max
  );
  const lowestDiastolic = periodAverages.reduce((min, current) => 
    current.avgDiastolic < min.avgDiastolic ? current : min
  );

  // Generate insights based on time patterns
  const systolicDiff = highestSystolic.avgSystolic - lowestSystolic.avgSystolic;
  const diastolicDiff = highestDiastolic.avgDiastolic - lowestDiastolic.avgDiastolic;

  if (systolicDiff >= 10) {
    insights.push(
      `Your systolic pressure varies significantly by time of day: highest in ${highestSystolic.period} (${highestSystolic.avgSystolic} mmHg) and lowest in ${lowestSystolic.period} (${lowestSystolic.avgSystolic} mmHg). This ${systolicDiff}-point difference suggests circadian patterns.`
    );
  }

  if (diastolicDiff >= 8) {
    insights.push(
      `Your diastolic pressure shows notable time-based variation: highest in ${highestDiastolic.period} (${highestDiastolic.avgDiastolic} mmHg) and lowest in ${lowestDiastolic.period} (${lowestDiastolic.avgDiastolic} mmHg).`
    );
  }

  // Check for consistent high readings in specific periods
  const highRiskPeriods = periodAverages.filter(period => 
    period.avgSystolic >= 140 || period.avgDiastolic >= 90
  );

  if (highRiskPeriods.length > 0) {
    const periodNames = highRiskPeriods.map(p => p.period).join(', ');
    insights.push(
      `Your blood pressure readings are consistently high during ${periodNames}. Consider monitoring these times more closely and discussing with your healthcare provider.`
    );
  }

  // Check for optimal periods
  const optimalPeriods = periodAverages.filter(period => 
    period.avgSystolic < 120 && period.avgDiastolic < 80
  );

  if (optimalPeriods.length > 0) {
    const periodNames = optimalPeriods.map(p => p.period).join(', ');
    insights.push(
      `Your blood pressure is consistently optimal during ${periodNames}. This suggests these may be your best times for important activities or medications.`
    );
  }

  return insights;
};
