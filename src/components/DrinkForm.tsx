import React, { useState, useEffect } from 'react';
import { DrinkEntry } from '../types';
import { Wine, Calendar, Plus } from 'lucide-react';
import { toLocalDateTimeString, fromLocalDateTimeString, getCurrentLocalDateTime, getTimeAgo } from '../utils/timezone';

interface DrinkFormProps {
  onSubmit: (entry: Omit<DrinkEntry, 'id'>) => void;
  onCancel?: () => void;
  initialData?: Partial<DrinkEntry>;
  isEditing?: boolean;
}

export const DrinkForm: React.FC<DrinkFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState(() => {
    console.log('DrinkForm - initializing with initialData:', initialData);
    return {
      count: initialData?.count || 1,
      timestamp: initialData?.timestamp 
        ? toLocalDateTimeString(initialData.timestamp)
        : getCurrentLocalDateTime(),
      type: initialData?.type || '',
      alcoholContent: initialData?.alcoholContent || '',
      notes: initialData?.notes || ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when initialData changes (for editing)
  useEffect(() => {
    console.log('DrinkForm - initialData changed:', initialData);
    if (initialData) {
      const newFormData = {
        count: initialData.count || 1,
        timestamp: initialData.timestamp 
          ? toLocalDateTimeString(initialData.timestamp)
          : getCurrentLocalDateTime(),
        type: initialData.type || '',
        alcoholContent: initialData.alcoholContent || '',
        notes: initialData.notes || ''
      };
      console.log('DrinkForm - setting formData to:', newFormData);
      setFormData(newFormData);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.count || formData.count < 1 || formData.count > 20) {
      newErrors.count = 'Number of drinks must be between 1-20';
    }

    if (formData.alcoholContent && (Number(formData.alcoholContent) < 0 || Number(formData.alcoholContent) > 100)) {
      newErrors.alcoholContent = 'Alcohol content must be between 0-100%';
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
      count: Number(formData.count),
      timestamp: fromLocalDateTimeString(formData.timestamp),
      type: formData.type.trim() || undefined,
      alcoholContent: formData.alcoholContent ? Number(formData.alcoholContent) : undefined,
      notes: formData.notes.trim() || undefined
    });

    // Reset form if not editing
    if (!isEditing) {
      setFormData({
        count: 1,
        timestamp: getCurrentLocalDateTime(),
        type: '',
        alcoholContent: '',
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
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <Wine className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Drink Entry' : 'Add Drink Entry'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Drinks
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.count}
            onChange={(e) => handleInputChange('count', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.count ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="1"
          />
          {errors.count && (
            <p className="text-red-500 text-xs mt-1">{errors.count}</p>
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
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onClick={() => handleInputChange('timestamp', getTimeAgo(2, 'hour'))}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              2h ago
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('timestamp', getTimeAgo(1, 'day'))}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              Yesterday
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Drink (Optional)
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Wine, Beer, Whiskey"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alcohol % (Optional)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.alcoholContent}
              onChange={(e) => handleInputChange('alcoholContent', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.alcoholContent ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12.5"
            />
            {errors.alcoholContent && (
              <p className="text-red-500 text-xs mt-1">{errors.alcoholContent}</p>
            )}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any notes about the drinks..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
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
