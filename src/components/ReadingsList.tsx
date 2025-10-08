import React from 'react';
import { BloodPressureReading } from '../types';
import { Edit, Trash2, Calendar, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface ReadingsListProps {
  readings: BloodPressureReading[];
  onEdit: (reading: BloodPressureReading) => void;
  onDelete: (id: string) => void;
}

export const ReadingsList: React.FC<ReadingsListProps> = ({
  readings,
  onEdit,
  onDelete
}) => {
  const getPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) {
      return { category: 'Normal', color: 'text-green-600', bgColor: 'bg-green-100' };
    } else if (systolic < 130 && diastolic < 80) {
      return { category: 'Elevated', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else if (systolic < 140 && diastolic < 90) {
      return { category: 'Stage 1', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else {
      return { category: 'Stage 2', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  };

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No readings yet</p>
          <p className="text-gray-400 text-sm">Add your first blood pressure reading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="bg-primary-100 p-2 rounded-lg mr-3">
          <Calendar className="h-6 w-6 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">All Readings</h3>
        <span className="ml-auto text-sm text-gray-500">{readings.length} entries</span>
      </div>

      <div className="space-y-3">
        {readings.map((reading) => {
          const pressureCategory = getPressureCategory(reading.systolic, reading.diastolic);
          return (
            <div
              key={reading.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {reading.systolic}/{reading.diastolic}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reading.heartRate} BPM
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${pressureCategory.bgColor} ${pressureCategory.color}`}>
                      {pressureCategory.category}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(reading.timestamp), 'MMM dd, yyyy - h:mm a')}
                  </div>
                  
                  {(reading.notes || reading.cigars || reading.drinks) && (
                    <div className="mt-2 space-y-1">
                      {reading.notes && (
                        <div className="text-sm text-gray-600 italic">
                          "{reading.notes}"
                        </div>
                      )}
                      {(reading.cigars || reading.drinks) && (
                        <div className="space-y-1">
                          {reading.cigars && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                🚬 {reading.cigars.count} cigar{reading.cigars.count > 1 ? 's' : ''}
                              </span>
                              {reading.cigars.brand && (
                                <span className="text-gray-500">({reading.cigars.brand})</span>
                              )}
                              <span className="text-gray-400">
                                {format(new Date(reading.cigars.timestamp), 'h:mm a')}
                              </span>
                            </div>
                          )}
                          {reading.drinks && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                🍷 {reading.drinks.count} drink{reading.drinks.count > 1 ? 's' : ''}
                              </span>
                              {reading.drinks.type && (
                                <span className="text-gray-500">({reading.drinks.type})</span>
                              )}
                              {reading.drinks.alcoholContent && (
                                <span className="text-gray-500">{reading.drinks.alcoholContent}% ABV</span>
                              )}
                              <span className="text-gray-400">
                                {format(new Date(reading.drinks.timestamp), 'h:mm a')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onEdit(reading)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit reading"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(reading.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete reading"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
