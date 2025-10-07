import React, { useState } from 'react';
import { BloodPressureReading } from '../types';
import { Heart, Calendar, Plus } from 'lucide-react';
import { toLocalDateTimeString, fromLocalDateTimeString, getCurrentLocalDateTime, getTimeAgo } from '../utils/timezone';

interface BloodPressureFormProps {
  onSubmit: (reading: Omit<BloodPressureReading, 'id'>) => void;
  onCancel?: () => void;
  initialData?: Partial<BloodPressureReading>;
  isEditing?: boolean;
}

export const BloodPressureForm: React.FC<BloodPressureFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    systolic: initialData?.systolic || '',
    diastolic: initialData?.diastolic || '',
    heartRate: initialData?.heartRate || '',
    timestamp: initialData?.timestamp 
      ? toLocalDateTimeString(initialData.timestamp)
      : getCurrentLocalDateTime(),
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.systolic || formData.systolic < 50 || formData.systolic > 300) {
      newErrors.systolic = 'Systolic pressure must be between 50-300 mmHg';
    }

    if (!formData.diastolic || formData.diastolic < 30 || formData.diastolic > 200) {
      newErrors.diastolic = 'Diastolic pressure must be between 30-200 mmHg';
    }

    if (formData.systolic && formData.diastolic && Number(formData.systolic) <= Number(formData.diastolic)) {
      newErrors.systolic = 'Systolic pressure must be higher than diastolic pressure';
    }

    if (!formData.heartRate || formData.heartRate < 30 || formData.heartRate > 200) {
      newErrors.heartRate = 'Heart rate must be between 30-200 BPM';
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
      systolic: Number(formData.systolic),
      diastolic: Number(formData.diastolic),
      heartRate: Number(formData.heartRate),
      timestamp: fromLocalDateTimeString(formData.timestamp),
      notes: formData.notes.trim() || undefined
    });

    // Reset form if not editing
    if (!isEditing) {
      setFormData({
        systolic: '',
        diastolic: '',
        heartRate: '',
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
        <div className="bg-primary-100 p-2 rounded-lg mr-3">
          <Heart className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Reading' : 'Add Blood Pressure Reading'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Systolic (mmHg)
            </label>
            <input
              type="number"
              min="50"
              max="300"
              value={formData.systolic}
              onChange={(e) => handleInputChange('systolic', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.systolic ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="120"
            />
            {errors.systolic && (
              <p className="text-red-500 text-xs mt-1">{errors.systolic}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diastolic (mmHg)
            </label>
            <input
              type="number"
              min="30"
              max="200"
              value={formData.diastolic}
              onChange={(e) => handleInputChange('diastolic', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.diastolic ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="80"
            />
            {errors.diastolic && (
              <p className="text-red-500 text-xs mt-1">{errors.diastolic}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heart Rate (BPM)
          </label>
          <input
            type="number"
            min="30"
            max="200"
            value={formData.heartRate}
            onChange={(e) => handleInputChange('heartRate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.heartRate ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="72"
          />
          {errors.heartRate && (
            <p className="text-red-500 text-xs mt-1">{errors.heartRate}</p>
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
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Any additional notes about this reading..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Reading' : 'Add Reading'}
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
