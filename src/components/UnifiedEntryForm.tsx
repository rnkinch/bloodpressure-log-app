import React, { useState } from 'react';
import { BloodPressureForm } from './BloodPressureForm';
import { CigarForm } from './CigarForm';
import { DrinkForm } from './DrinkForm';
import { WeightForm } from './WeightForm';
import { Heart, Cigarette, Wine, Scale } from 'lucide-react';

interface UnifiedEntryFormProps {
  onSubmitBP: (data: any) => void;
  onSubmitCigar: (data: any) => void;
  onSubmitDrink: (data: any) => void;
  onSubmitWeight: (data: any) => void;
  initialBPData?: any;
  initialCigarData?: any;
  initialDrinkData?: any;
  initialWeightData?: any;
  isEditingBP?: boolean;
  isEditingCigar?: boolean;
  isEditingDrink?: boolean;
  isEditingWeight?: boolean;
  onCancelBP?: () => void;
  onCancelCigar?: () => void;
  onCancelDrink?: () => void;
  onCancelWeight?: () => void;
}

type FormTab = 'bp' | 'cigar' | 'drink' | 'weight';

const UnifiedEntryForm: React.FC<UnifiedEntryFormProps> = ({
  onSubmitBP,
  onSubmitCigar,
  onSubmitDrink,
  onSubmitWeight,
  initialBPData,
  initialCigarData,
  initialDrinkData,
  initialWeightData,
  isEditingBP,
  isEditingCigar,
  isEditingDrink,
  isEditingWeight,
  onCancelBP,
  onCancelCigar,
  onCancelDrink,
  onCancelWeight
}) => {
  const [activeTab, setActiveTab] = useState<FormTab>(() => {
    if (isEditingBP) return 'bp';
    if (isEditingCigar) return 'cigar';
    if (isEditingDrink) return 'drink';
    if (isEditingWeight) return 'weight';
    return 'bp';
  });

  const getTabStyle = (tab: FormTab) => {
    const baseStyle = "flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors";
    
    if (tab === activeTab) {
      switch (tab) {
        case 'bp':
          return `${baseStyle} bg-red-100 text-red-800 border-b-2 border-red-600`;
        case 'cigar':
          return `${baseStyle} bg-orange-100 text-orange-800 border-b-2 border-orange-600`;
        case 'drink':
          return `${baseStyle} bg-blue-100 text-blue-800 border-b-2 border-blue-600`;
        case 'weight':
          return `${baseStyle} bg-green-100 text-green-800 border-b-2 border-green-600`;
      }
    }
    
    return `${baseStyle} bg-gray-50 text-gray-600 hover:bg-gray-100`;
  };

  const getFormContainerStyle = () => {
    switch (activeTab) {
      case 'bp':
        return "bg-red-50 rounded-b-lg rounded-tr-lg p-6";
      case 'cigar':
        return "bg-orange-50 rounded-b-lg rounded-tr-lg p-6";
      case 'drink':
        return "bg-blue-50 rounded-b-lg rounded-tr-lg p-6";
      case 'weight':
        return "bg-green-50 rounded-b-lg rounded-tr-lg p-6";
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add New Entry</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('bp')}
            className={getTabStyle('bp')}
          >
            <Heart className="h-4 w-4 mr-2" />
            Blood Pressure
          </button>
          <button
            onClick={() => setActiveTab('cigar')}
            className={getTabStyle('cigar')}
          >
            <Cigarette className="h-4 w-4 mr-2" />
            Cigar
          </button>
          <button
            onClick={() => setActiveTab('drink')}
            className={getTabStyle('drink')}
          >
            <Wine className="h-4 w-4 mr-2" />
            Drink
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={getTabStyle('weight')}
          >
            <Scale className="h-4 w-4 mr-2" />
            Weight
          </button>
        </div>
        
        {/* Form Content */}
        <div className={getFormContainerStyle()}>
          {activeTab === 'bp' && (
            <BloodPressureForm
              onSubmit={onSubmitBP}
              onCancel={onCancelBP}
              initialData={initialBPData}
              isEditing={isEditingBP || false}
            />
          )}
          
          {activeTab === 'cigar' && (
            <CigarForm
              onSubmit={onSubmitCigar}
              onCancel={onCancelCigar}
              initialData={initialCigarData}
              isEditing={isEditingCigar || false}
            />
          )}
          
          {activeTab === 'drink' && (
            <DrinkForm
              onSubmit={onSubmitDrink}
              onCancel={onCancelDrink}
              initialData={initialDrinkData}
              isEditing={isEditingDrink || false}
            />
          )}
          
          {activeTab === 'weight' && (
            <WeightForm
              onSubmit={onSubmitWeight}
              onCancel={onCancelWeight}
              initialData={initialWeightData}
              isEditing={isEditingWeight || false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedEntryForm;
