import React, { useState, useMemo } from 'react';
import { useBloodPressureData } from './hooks/useBloodPressureData';
import { useLifestyleData } from './hooks/useLifestyleData';
import { BloodPressureForm } from './components/BloodPressureForm';
import { BloodPressureChart } from './components/BloodPressureChart';
import { AIAnalysis } from './components/AIAnalysis';
import { BloodPressureStatsComponent } from './components/BloodPressureStats';
import { ReadingsList } from './components/ReadingsList';
import { CigarForm } from './components/CigarForm';
import { DrinkForm } from './components/DrinkForm';
import { LifestyleEntriesList } from './components/LifestyleEntriesList';
import { calculateStats, analyzeTrends, prepareChartData } from './utils/analysis';
import { Heart, Plus, BarChart3, Brain, Activity, List, Cigarette, Wine } from 'lucide-react';
import './App.css';

type ViewMode = 'form' | 'chart' | 'analysis' | 'stats' | 'readings' | 'cigar' | 'drink' | 'lifestyle';

function App() {
  const { readings, loading, addReading, updateReading, deleteReading } = useBloodPressureData();
  const { 
    cigarEntries, 
    drinkEntries, 
    loading: lifestyleLoading,
    addCigarEntry,
    updateCigarEntry,
    deleteCigarEntry,
    addDrinkEntry,
    updateDrinkEntry,
    deleteDrinkEntry
  } = useLifestyleData();
  
  const [currentView, setCurrentView] = useState<ViewMode>('form');
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [editingReading, setEditingReading] = useState<any>(null);
  const [editingCigar, setEditingCigar] = useState<any>(null);
  const [editingDrink, setEditingDrink] = useState<any>(null);
  
  const filteredChartData = useMemo(() => {
    const now = new Date();
    let filtered = readings;
    
    if (chartPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = readings.filter(r => r.timestamp >= weekAgo);
    } else if (chartPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = readings.filter(r => r.timestamp >= monthAgo);
    }
    
    return prepareChartData(filtered, cigarEntries, drinkEntries);
  }, [readings, chartPeriod, cigarEntries, drinkEntries]);

  const stats = useMemo(() => calculateStats(readings, chartPeriod), [readings, chartPeriod]);
  const analysis = useMemo(() => analyzeTrends(readings, cigarEntries, drinkEntries), [readings, cigarEntries, drinkEntries]);

  const handleAddReading = async (reading: any) => {
    try {
      await addReading(reading);
      setCurrentView('chart');
    } catch (error) {
      console.error('Failed to add reading:', error);
    }
  };

  const handleEditReading = (reading: any) => {
    setEditingReading(reading);
    setCurrentView('form');
  };

  const handleUpdateReading = async (reading: any) => {
    try {
      await updateReading(editingReading.id, reading);
      setEditingReading(null);
      setCurrentView('chart');
    } catch (error) {
      console.error('Failed to update reading:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
    setCurrentView('chart');
  };

  // Lifestyle handlers
  const handleAddCigar = async (cigar: any) => {
    try {
      await addCigarEntry(cigar);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to add cigar entry:', error);
    }
  };

  const handleEditCigar = (cigar: any) => {
    setEditingCigar(cigar);
    setCurrentView('cigar');
  };

  const handleUpdateCigar = async (cigar: any) => {
    try {
      await updateCigarEntry(editingCigar.id, cigar);
      setEditingCigar(null);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to update cigar entry:', error);
    }
  };

  const handleDeleteCigar = async (id: string) => {
    try {
      await deleteCigarEntry(id);
    } catch (error) {
      console.error('Failed to delete cigar entry:', error);
    }
  };

  const handleCancelCigarEdit = () => {
    setEditingCigar(null);
    setCurrentView('lifestyle');
  };

  const handleAddDrink = async (drink: any) => {
    try {
      await addDrinkEntry(drink);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to add drink entry:', error);
    }
  };

  const handleEditDrink = (drink: any) => {
    setEditingDrink(drink);
    setCurrentView('drink');
  };

  const handleUpdateDrink = async (drink: any) => {
    try {
      await updateDrinkEntry(editingDrink.id, drink);
      setEditingDrink(null);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to update drink entry:', error);
    }
  };

  const handleDeleteDrink = async (id: string) => {
    try {
      await deleteDrinkEntry(id);
    } catch (error) {
      console.error('Failed to delete drink entry:', error);
    }
  };

  const handleCancelDrinkEdit = () => {
    setEditingDrink(null);
    setCurrentView('lifestyle');
  };

  if (loading || lifestyleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your blood pressure data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-primary-100 p-2 rounded-lg mr-3">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Blood Pressure Tracker</h1>
            </div>
            <div className="text-sm text-gray-500">
              {readings.length} reading{readings.length !== 1 ? 's' : ''} logged
              <span className="ml-2 text-xs">
                ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'form', label: 'Add Reading', icon: Plus },
              { id: 'readings', label: 'All Readings', icon: List },
              { id: 'chart', label: 'Charts', icon: BarChart3 },
              { id: 'analysis', label: 'AI Analysis', icon: Brain },
              { id: 'stats', label: 'Statistics', icon: Activity },
              { id: 'lifestyle', label: 'Lifestyle', icon: Cigarette }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as ViewMode)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  currentView === id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'form' && (
          <div className="max-w-2xl mx-auto">
            <BloodPressureForm
              onSubmit={editingReading ? handleUpdateReading : handleAddReading}
              onCancel={editingReading ? handleCancelEdit : undefined}
              initialData={editingReading}
              isEditing={!!editingReading}
            />
          </div>
        )}

        {currentView === 'chart' && (
          <div className="space-y-6">
            <BloodPressureChart
              data={filteredChartData}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>
        )}

        {currentView === 'analysis' && (
          <div className="max-w-4xl mx-auto">
            <AIAnalysis analysis={analysis} />
          </div>
        )}

        {currentView === 'stats' && (
          <div className="max-w-4xl mx-auto">
            <BloodPressureStatsComponent stats={stats} />
          </div>
        )}

        {currentView === 'readings' && (
          <div className="max-w-4xl mx-auto">
            <ReadingsList
              readings={readings}
              onEdit={handleEditReading}
              onDelete={async (id) => {
                try {
                  await deleteReading(id);
                } catch (error) {
                  console.error('Failed to delete reading:', error);
                }
              }}
            />
          </div>
        )}

        {currentView === 'cigar' && (
          <div className="max-w-2xl mx-auto">
            <CigarForm
              onSubmit={editingCigar ? handleUpdateCigar : handleAddCigar}
              onCancel={editingCigar ? handleCancelCigarEdit : undefined}
              initialData={editingCigar}
              isEditing={!!editingCigar}
            />
          </div>
        )}

        {currentView === 'drink' && (
          <div className="max-w-2xl mx-auto">
            <DrinkForm
              onSubmit={editingDrink ? handleUpdateDrink : handleAddDrink}
              onCancel={editingDrink ? handleCancelDrinkEdit : undefined}
              initialData={editingDrink}
              isEditing={!!editingDrink}
            />
          </div>
        )}

        {currentView === 'lifestyle' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentView('cigar')}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Cigarette className="h-4 w-4 mr-2" />
                Add Cigar Entry
              </button>
              <button
                onClick={() => setCurrentView('drink')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Wine className="h-4 w-4 mr-2" />
                Add Drink Entry
              </button>
            </div>
            <LifestyleEntriesList
              cigarEntries={cigarEntries}
              drinkEntries={drinkEntries}
              onEditCigar={handleEditCigar}
              onDeleteCigar={handleDeleteCigar}
              onEditDrink={handleEditDrink}
              onDeleteDrink={handleDeleteDrink}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Blood Pressure Tracker - Track your health with AI-powered insights</p>
            <p className="mt-1">
              This app is for informational purposes only. Always consult with a healthcare provider for medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
