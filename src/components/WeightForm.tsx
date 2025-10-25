import React, { useState } from 'react';
import { WeightEntry } from '../types';
import { Scale, Calendar, Plus } from 'lucide-react';
import { toLocalDateTimeString, fromLocalDateTimeString, getCurrentLocalDateTime, getTimeAgo } from '../utils/timezone';

interface WeightFormProps {
  onSubmit: (entry: Omit<WeightEntry, 'id'>) => void;
  onCancel?: () => void;
  initialData?: Partial<WeightEntry>;
  isEditing?: boolean;
}

export const WeightForm: React.FC<WeightFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    weight: initialData?.weight || '',
    timestamp: initialData?.timestamp 
      ? toLocalDateTimeString(initialData.timestamp)
      : getCurrentLocalDateTime(),
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.weight || formData.weight < 30 || formData.weight > 500) {
      newErrors.weight = 'Weight must be between 30-500 lbs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      weight: Number(formData.weight),
      timestamp: fromLocalDateTimeString(formData.timestamp),
      notes: formData.notes.trim() || undefined
    });

    // Reset form if not editing
    if (!isEditing) {
      setFormData({
        weight: '',
        timestamp: getCurrentLocalDateTime(),
        notes: ''
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <div className="bg-green-100 p-2 rounded-lg mr-3">
          <Scale className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Weight Entry' : 'Add Weight Entry'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (lbs)
          </label>
          <input
            type="number"
            min="30"
            max="500"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.weight ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="150.0"
          />
          {errors.weight && (
            <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date & Time
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) => handleInputChange('timestamp', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {/* Quick time shortcuts */}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleInputChange('timestamp', getCurrentLocalDateTime())}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('timestamp', getTimeAgo(1, 'hour'))}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              1h ago
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('timestamp', getTimeAgo(1, 'day'))}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('timestamp', getTimeAgo(1, 'week'))}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              1 week ago
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Any notes about your weight measurement..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Entry' : 'Add Entry'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
