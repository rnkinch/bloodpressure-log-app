import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  ComposedChart
} from 'recharts';
import { ChartDataPoint, TimeRangeFilter } from '../types';
import { TrendingUp, Activity, Clock } from 'lucide-react';

interface BloodPressureChartProps {
  data: ChartDataPoint[];
  period: 'week' | 'month' | 'all';
  onPeriodChange: (period: 'week' | 'month' | 'all') => void;
  timeBand?: TimeRangeFilter;
}

export const BloodPressureChart: React.FC<BloodPressureChartProps> = ({
  data,
  period,
  onPeriodChange,
  timeBand
}) => {
  const formatTooltipValue = (value: number, name: string) => {
    const unit = name === 'heartRate' ? ' BPM' : ' mmHg';
    return [value + unit, name === 'systolic' ? 'Systolic' : name === 'diastolic' ? 'Diastolic' : 'Heart Rate'];
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      default: return 'All Time';
    }
  };

  const formatHourLabel = (hour: number) => {
    let baseHour = Math.floor(hour);
    let minutes = Math.round((hour - baseHour) * 60);

    if (minutes === 60) {
      baseHour += 1;
      minutes = 0;
    }

    const normalizedHour = ((baseHour % 24) + 24) % 24;
    const date = new Date(0, 0, 0, normalizedHour, minutes);

    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderTimeBandNotice = () => {
    if (!timeBand?.enabled) {
      return null;
    }

    return (
      <div className="mb-4 px-3 py-2 bg-primary-50 border border-primary-100 text-primary-700 text-sm rounded-md flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span>
          Showing readings recorded between {formatHourLabel(timeBand.startHour)} and {formatHourLabel(timeBand.endHour)} each day.
        </span>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-secondary-100 p-2 rounded-lg mr-3">
              <TrendingUp className="h-6 w-6 text-secondary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Blood Pressure Trends</h3>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {renderTimeBandNotice()}
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No data available</p>
          <p className="text-gray-400 text-sm">Add some blood pressure readings to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-secondary-100 p-2 rounded-lg mr-3">
            <TrendingUp className="h-6 w-6 text-secondary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Blood Pressure Trends</h3>
            <p className="text-sm text-gray-500">{getPeriodLabel(period)}</p>
          </div>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['week', 'month', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {renderTimeBandNotice()}

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="pressure"
              orientation="left"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[60, 200]}
            />
            <YAxis 
              yAxisId="heartRate"
              orientation="right"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[40, 120]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]?.payload;
                  return (
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900 mb-2">{label}</p>
                      {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          {entry.name}: {entry.value}
                          {entry.dataKey === 'systolic' || entry.dataKey === 'diastolic' ? ' mmHg' : 
                           entry.dataKey === 'heartRate' ? ' bpm' : ''}
                        </p>
                      ))}
                      {data?.lifestyle && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-1">Lifestyle Activities:</p>
                          {data.lifestyle.cigars > 0 && (
                            <p className="text-xs text-orange-600">🚬 {data.lifestyle.cigars} cigar{data.lifestyle.cigars > 1 ? 's' : ''}</p>
                          )}
                          {data.lifestyle.drinks > 0 && (
                            <p className="text-xs text-blue-600">🍷 {data.lifestyle.drinks} drink{data.lifestyle.drinks > 1 ? 's' : ''}</p>
                          )}
                          {data.lifestyle.alcoholContent > 0 && (
                            <p className="text-xs text-gray-500">({data.lifestyle.alcoholContent.toFixed(1)}% ABV avg)</p>
                          )}
                          {data.lifestyle.cardioMinutes && data.lifestyle.cardioMinutes > 0 && (
                            <p className="text-xs text-purple-600">🏃‍♂️ {data.lifestyle.cardioMinutes} min cardio</p>
                          )}
                          {data.lifestyle.cardioActivities && data.lifestyle.cardioActivities.length > 0 && (
                            <p className="text-[10px] text-gray-500">
                              {data.lifestyle.cardioActivities.join(', ')}
                            </p>
                          )}
                          {data.lifestyle.events && data.lifestyle.events.length > 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                              🗒️ {data.lifestyle.events.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            
            {/* Reference lines for normal blood pressure ranges */}
            <ReferenceLine yAxisId="pressure" y={120} stroke="#10b981" strokeDasharray="2 2" />
            <ReferenceLine yAxisId="pressure" y={80} stroke="#10b981" strokeDasharray="2 2" />
            
            <Line
              yAxisId="pressure"
              type="monotone"
              dataKey="systolic"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              name="Systolic"
            />
            <Line
              yAxisId="pressure"
              type="monotone"
              dataKey="diastolic"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              name="Diastolic"
            />
            <Line
              yAxisId="heartRate"
              type="monotone"
              dataKey="heartRate"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2 }}
              name="Heart Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Green dashed lines indicate normal blood pressure ranges (120/80 mmHg)</p>
      </div>
    </div>
  );
};
