import React from 'react';
import { WeightEntry } from '../types';
import { Scale, Edit, Trash2, Calendar } from 'lucide-react';

interface WeightEntriesListProps {
  weightEntries: WeightEntry[];
  onEdit: (entry: WeightEntry) => void;
  onDelete: (id: string) => void;
}

export const WeightEntriesList: React.FC<WeightEntriesListProps> = ({
  weightEntries,
  onEdit,
  onDelete
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(1)} lbs`;
  };

  if (weightEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Scale className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Weight Entries</h3>
        <p className="text-gray-500">Start tracking your weight to see your progress over time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Scale className="h-5 w-5 mr-2 text-green-600" />
          Weight Entries ({weightEntries.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {weightEntries.map((entry) => (
          <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Scale className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatWeight(entry.weight)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(entry.timestamp)}
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(entry)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit entry"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
