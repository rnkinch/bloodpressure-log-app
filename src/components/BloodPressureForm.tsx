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
    <div className="glass-card-hover p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 sm:p-3 rounded-xl sm:rounded-xl mr-3 sm:mr-4 shadow-lg flex-shrink-0">
          <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Reading' : 'Add Blood Pressure Reading'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
            {isEditing ? 'Update your blood pressure reading' : 'Record a new blood pressure measurement'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className={`input-modern ${
                errors.systolic ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
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
              className={`input-modern ${
                errors.diastolic ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
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
            className={`input-modern ${
              errors.heartRate ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
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
              className="input-modern pl-10"
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
            className="input-modern"
            placeholder="Any additional notes about this reading..."
          />
        </div>


        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
          <button
            type="submit"
            className="btn-modern flex-1 flex items-center justify-center min-h-[44px] sm:min-h-0"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {isEditing ? 'Update Reading' : 'Add Reading'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-modern-secondary min-h-[44px] sm:min-h-0"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
