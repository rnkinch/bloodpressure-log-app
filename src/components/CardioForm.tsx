import React, { useState } from 'react';
import { Activity, Calendar, Plus } from 'lucide-react';
import { CardioEntry } from '../types';
import { getCurrentLocalDateTime, getTimeAgo, toLocalDateTimeString, fromLocalDateTimeString } from '../utils/timezone';

interface CardioFormProps {
  onSubmit: (entry: Omit<CardioEntry, 'id'>) => void;
  onCancel?: () => void;
  initialData?: Partial<CardioEntry>;
  isEditing?: boolean;
}

export const CardioForm: React.FC<CardioFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    activity: initialData?.activity || '',
    minutes: initialData?.minutes ?? 30,
    timestamp: initialData?.timestamp
      ? toLocalDateTimeString(initialData.timestamp)
      : getCurrentLocalDateTime(),
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.activity.trim()) {
      newErrors.activity = 'Activity is required';
    }

    if (!formData.minutes || formData.minutes < 1 || formData.minutes > 600) {
      newErrors.minutes = 'Minutes must be between 1-600';
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
      activity: formData.activity.trim(),
      minutes: Number(formData.minutes),
      timestamp: fromLocalDateTimeString(formData.timestamp),
      notes: formData.notes.trim() || undefined
    });

    if (!isEditing) {
      setFormData({
        activity: '',
        minutes: 30,
        timestamp: getCurrentLocalDateTime(),
        notes: ''
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 p-2 rounded-lg mr-3">
          <Activity className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Cardio Entry' : 'Add Cardio Entry'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity
          </label>
          <input
            type="text"
            value={formData.activity}
            onChange={(e) => handleInputChange('activity', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.activity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Running, Cycling, Walking"
          />
          {errors.activity && (
            <p className="text-red-500 text-xs mt-1">{errors.activity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minutes
          </label>
          <input
            type="number"
            min="1"
            max="600"
            value={formData.minutes}
            onChange={(e) => handleInputChange('minutes', Number(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.minutes ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="30"
          />
          {errors.minutes && (
            <p className="text-red-500 text-xs mt-1">{errors.minutes}</p>
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
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Add any details about your workout..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
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

export default CardioForm;

