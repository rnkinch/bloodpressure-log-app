import React from 'react';
import { BloodPressureStats } from '../types';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface BloodPressureStatsProps {
  stats: BloodPressureStats;
}

export const BloodPressureStatsComponent: React.FC<BloodPressureStatsProps> = ({ stats }) => {
  const getPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) {
      return { category: 'Normal', color: 'text-green-600', bgColor: 'bg-green-100' };
    } else if (systolic < 130 && diastolic < 80) {
      return { category: 'Elevated', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else if (systolic < 140 && diastolic < 90) {
      return { category: 'Stage 1 Hypertension', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else {
      return { category: 'Stage 2 Hypertension', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  };

  const pressureCategory = getPressureCategory(stats.averageSystolic, stats.averageDiastolic);

  if (stats.totalReadings === 0) {
    return (
      <div className="glass-card-hover p-4 sm:p-6">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-2 rounded-lg mr-3 flex-shrink-0">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Statistics</h3>
        </div>
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data available</p>
          <p className="text-gray-400 text-sm">Add readings to see statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-hover p-4 sm:p-6">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-2 rounded-lg mr-3 flex-shrink-0">
          <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Statistics</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {stats.period === 'week' ? 'Last 7 days' : 
             stats.period === 'month' ? 'Last 30 days' : 'All time'} 
            ({stats.totalReadings} readings)
          </p>
        </div>
      </div>

      {/* Average Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Average Systolic</span>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.averageSystolic}</p>
          <p className="text-xs text-gray-500">mmHg</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Average Diastolic</span>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.averageDiastolic}</p>
          <p className="text-xs text-gray-500">mmHg</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Average Heart Rate</span>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.averageHeartRate}</p>
          <p className="text-xs text-gray-500">BPM</p>
        </div>
      </div>

      {/* Range Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Systolic Range</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Highest:</span>
              <span className="text-sm font-semibold text-red-600">{stats.maxSystolic} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Lowest:</span>
              <span className="text-sm font-semibold text-green-600">{stats.minSystolic} mmHg</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Diastolic Range</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Highest:</span>
              <span className="text-sm font-semibold text-red-600">{stats.maxDiastolic} mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Lowest:</span>
              <span className="text-sm font-semibold text-green-600">{stats.minDiastolic} mmHg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Pressure Category */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Blood Pressure Category</h4>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${pressureCategory.bgColor}`}>
          <span className={pressureCategory.color}>{pressureCategory.category}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Based on average readings: {stats.averageSystolic}/{stats.averageDiastolic} mmHg
        </p>
      </div>
    </div>
  );
};
