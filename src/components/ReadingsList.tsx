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
    <div className="glass-card-hover p-4 sm:p-6">
      <div className="flex items-center mb-4 sm:mb-6 flex-wrap gap-2">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1">All Readings</h3>
        <span className="text-xs sm:text-sm text-gray-500 bg-white/50 px-2 py-1 rounded-lg">{readings.length} entries</span>
      </div>

      <div className="space-y-3">
        {readings.map((reading) => {
          const pressureCategory = getPressureCategory(reading.systolic, reading.diastolic);
          return (
            <div
              key={reading.id}
              className="glass-card border border-white/30 rounded-xl p-3 sm:p-4 hover:bg-white/90 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {reading.systolic}/{reading.diastolic}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {reading.heartRate} BPM
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${pressureCategory.bgColor} ${pressureCategory.color}`}>
                      {pressureCategory.category}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{format(new Date(reading.timestamp), 'MMM dd, yyyy - h:mm a')}</span>
                  </div>
                  
                  {reading.notes && (
                    <div className="mt-2 text-xs sm:text-sm text-gray-600 italic truncate">
                      "{reading.notes}"
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 sm:ml-4 flex-shrink-0">
                  <button
                    onClick={() => onEdit(reading)}
                    className="p-2 sm:p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    title="Edit reading"
                    aria-label="Edit reading"
                  >
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(reading.id)}
                    className="p-2 sm:p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    title="Delete reading"
                    aria-label="Delete reading"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
