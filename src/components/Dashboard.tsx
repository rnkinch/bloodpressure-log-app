import React, { useMemo } from 'react';
import { BloodPressureReading, CigarEntry, DrinkEntry, WeightEntry, ChartDataPoint } from '../types';
import { format, subDays } from 'date-fns';
import { 
  Heart, 
  Activity, 
  Cigarette, 
  Wine, 
  Scale, 
  Plus, 
  CalendarDays, 
  LineChart,
  BarChart3
} from 'lucide-react';

interface DashboardProps {
  readings: BloodPressureReading[];
  cigarEntries: CigarEntry[];
  drinkEntries: DrinkEntry[];
  weightEntries: WeightEntry[];
  chartData: ChartDataPoint[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  readings,
  cigarEntries,
  drinkEntries,
  weightEntries,
  chartData,
  onNavigate
}) => {
  // Get the most recent reading
  const latestReading = useMemo(() => {
    if (readings.length === 0) return null;
    return readings.reduce((latest, current) => 
      latest.timestamp > current.timestamp ? latest : current
    );
  }, [readings]);

  // Get recent lifestyle entries (last 7 days)
  const recentEntries = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    
    return {
      cigars: cigarEntries.filter(entry => entry.timestamp >= sevenDaysAgo),
      drinks: drinkEntries.filter(entry => entry.timestamp >= sevenDaysAgo),
      weights: weightEntries.filter(entry => entry.timestamp >= sevenDaysAgo)
    };
  }, [cigarEntries, drinkEntries, weightEntries]);

  // Calculate quick stats
  const quickStats = useMemo(() => {
    // Blood pressure stats
    const recentReadings = readings.filter(r => r.timestamp >= subDays(new Date(), 30));
    
    const avgSystolic = recentReadings.length > 0 
      ? Math.round(recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length) 
      : 0;
    
    const avgDiastolic = recentReadings.length > 0 
      ? Math.round(recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length) 
      : 0;
    
    // Lifestyle stats
    const totalCigars = recentEntries.cigars.reduce((sum, entry) => sum + entry.count, 0);
    const totalDrinks = recentEntries.drinks.reduce((sum, entry) => sum + entry.count, 0);
    
    // Weight stats
    const latestWeight = weightEntries.length > 0 
      ? weightEntries.reduce((latest, current) => 
          latest.timestamp > current.timestamp ? latest : current
        ) 
      : null;
    
    return {
      avgSystolic,
      avgDiastolic,
      totalCigars,
      totalDrinks,
      latestWeight: latestWeight?.weight || 0
    };
  }, [readings, recentEntries, weightEntries]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('add-entry')}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Add BP Reading</span>
          </button>
          
          <button
            onClick={() => { onNavigate('add-entry'); }}
            className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div className="bg-orange-100 p-3 rounded-full mb-2">
              <Cigarette className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium">Add Cigar</span>
          </button>
          
          <button
            onClick={() => { onNavigate('add-entry'); }}
            className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div className="bg-indigo-100 p-3 rounded-full mb-2">
              <Wine className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-sm font-medium">Add Drink</span>
          </button>
          
          <button
            onClick={() => { onNavigate('add-entry'); }}
            className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <Scale className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium">Add Weight</span>
          </button>
        </div>
      </div>

      {/* Latest Reading */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Latest Blood Pressure Reading</h3>
          <button
            onClick={() => onNavigate('readings')}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View All
            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {latestReading ? (
          <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-500">
                  {format(latestReading.timestamp, 'MMM d, yyyy h:mm a')}
                </div>
                <div className="font-bold text-xl">
                  {latestReading.systolic}/{latestReading.diastolic} mmHg
                </div>
                <div className="text-sm">
                  Heart Rate: {latestReading.heartRate} bpm
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:flex md:space-x-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">30-day Avg</div>
                <div className="font-bold">
                  {quickStats.avgSystolic}/{quickStats.avgDiastolic}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Total Readings</div>
                <div className="font-bold">{readings.length}</div>
              </div>
              
              <button
                onClick={() => onNavigate('chart')}
                className="col-span-2 flex items-center justify-center py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Charts
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No readings recorded yet</div>
            <button
              onClick={() => onNavigate('form')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Reading
            </button>
          </div>
        )}
      </div>

      {/* Recent Lifestyle Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cigars */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Cigarette className="h-5 w-5 mr-2 text-orange-600" />
              Cigars
            </h3>
            <div className="text-sm font-medium">Last 7 days</div>
          </div>
          
          {recentEntries.cigars.length > 0 ? (
            <>
              <div className="text-3xl font-bold mb-2">{quickStats.totalCigars}</div>
              <div className="text-sm text-gray-500 mb-4">Total cigars</div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recentEntries.cigars.slice(0, 3).map(entry => (
                  <div key={entry.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <div>
                      <div className="font-medium">{entry.count} {entry.count === 1 ? 'cigar' : 'cigars'}</div>
                      {entry.brand && <div className="text-xs text-gray-500">{entry.brand}</div>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(entry.timestamp, 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
              
              {recentEntries.cigars.length > 3 && (
                <div className="text-center mt-2">
                  <button 
                    onClick={() => onNavigate('lifestyle')}
                    className="text-sm text-orange-600 hover:text-orange-800"
                  >
                    View all ({recentEntries.cigars.length})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-gray-400 mb-2">No cigar entries</div>
              <button
                onClick={() => onNavigate('cigar')}
                className="text-sm text-orange-600 hover:text-orange-800"
              >
                Add Entry
              </button>
            </div>
          )}
        </div>
        
        {/* Drinks */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Wine className="h-5 w-5 mr-2 text-blue-600" />
              Drinks
            </h3>
            <div className="text-sm font-medium">Last 7 days</div>
          </div>
          
          {recentEntries.drinks.length > 0 ? (
            <>
              <div className="text-3xl font-bold mb-2">{quickStats.totalDrinks}</div>
              <div className="text-sm text-gray-500 mb-4">Total drinks</div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recentEntries.drinks.slice(0, 3).map(entry => (
                  <div key={entry.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <div>
                      <div className="font-medium">{entry.count} {entry.count === 1 ? 'drink' : 'drinks'}</div>
                      {entry.type && <div className="text-xs text-gray-500">{entry.type}</div>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(entry.timestamp, 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
              
              {recentEntries.drinks.length > 3 && (
                <div className="text-center mt-2">
                  <button 
                    onClick={() => onNavigate('lifestyle')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all ({recentEntries.drinks.length})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-gray-400 mb-2">No drink entries</div>
              <button
                onClick={() => onNavigate('drink')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Add Entry
              </button>
            </div>
          )}
        </div>
        
        {/* Weight */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Scale className="h-5 w-5 mr-2 text-green-600" />
              Weight
            </h3>
            <div className="text-sm font-medium">Last 7 days</div>
          </div>
          
          {recentEntries.weights.length > 0 ? (
            <>
              <div className="text-3xl font-bold mb-2">{quickStats.latestWeight}</div>
              <div className="text-sm text-gray-500 mb-4">Latest weight</div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recentEntries.weights.slice(0, 3).map(entry => (
                  <div key={entry.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <div>
                      <div className="font-medium">{entry.weight}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(entry.timestamp, 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
              
              {recentEntries.weights.length > 3 && (
                <div className="text-center mt-2">
                  <button 
                    onClick={() => onNavigate('lifestyle')}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    View all ({recentEntries.weights.length})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-gray-400 mb-2">No weight entries</div>
              <button
                onClick={() => onNavigate('weight')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Add Entry
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* View Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('calendar')}
          className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <CalendarDays className="h-5 w-5 mr-2 text-gray-600" />
          <span className="font-medium">View Calendar</span>
        </button>
        
        <button
          onClick={() => onNavigate('ai-assistant')}
          className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Activity className="h-5 w-5 mr-2 text-gray-600" />
          <span className="font-medium">AI Analysis</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
