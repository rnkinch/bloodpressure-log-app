import React, { useState, useMemo } from 'react';
import { useBloodPressureData } from './hooks/useBloodPressureData';
import { useLifestyleData } from './hooks/useLifestyleData';
import { useWeightData } from './hooks/useWeightData';
import { DrinkEntry, WeightEntry } from './types';
import { BloodPressureForm } from './components/BloodPressureForm';
import { BloodPressureChart } from './components/BloodPressureChart';
import { AIAnalysis } from './components/AIAnalysis';
import EnhancedAIFeatures from './components/EnhancedAIFeatures';
import { BloodPressureStatsComponent } from './components/BloodPressureStats';
import { ReadingsList } from './components/ReadingsList';
import { CigarForm } from './components/CigarForm';
import { DrinkForm } from './components/DrinkForm';
import { WeightForm } from './components/WeightForm';
import { LifestyleEntriesList } from './components/LifestyleEntriesList';
import LifestyleCalendar from './components/LifestyleCalendar';
import Dashboard from './components/Dashboard';
import UnifiedEntryForm from './components/UnifiedEntryForm';
import { WeightEntriesList } from './components/WeightEntriesList';
import { PrintReport } from './components/PrintReport';
import { calculateStats, analyzeTrends, prepareChartData } from './utils/analysis';
import { Heart, Plus, BarChart3, Brain, Activity, List, Cigarette, Wine, Scale, Printer, CalendarDays, Layout, PenSquare, LineChart } from 'lucide-react';
import './App.css';

type ViewMode = 'dashboard' | 'form' | 'chart' | 'ai-assistant' | 'stats' | 'readings' | 'cigar' | 'drink' | 'weight' | 'lifestyle' | 'print' | 'calendar' | 'add-entry';

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
  
  const {
    weightEntries,
    loading: weightLoading,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry
  } = useWeightData();
  
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [activeNavGroup, setActiveNavGroup] = useState<string>('overview');
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [editingReading, setEditingReading] = useState<any>(null);
  const [editingCigar, setEditingCigar] = useState<any>(null);
  const [editingDrink, setEditingDrink] = useState<DrinkEntry | null>(null);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  
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
    
    return prepareChartData(filtered, cigarEntries, drinkEntries, weightEntries);
  }, [readings, chartPeriod, cigarEntries, drinkEntries, weightEntries]);

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

  const handleEditDrink = (drink: DrinkEntry) => {
    console.log('App - handleEditDrink called with:', drink);
    setEditingDrink(drink);
    setCurrentView('drink');
  };

  const handleUpdateDrink = async (drink: any) => {
    if (!editingDrink) return;
    
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

  // Weight handlers
  const handleAddWeight = async (weight: any) => {
    try {
      await addWeightEntry(weight);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to add weight entry:', error);
    }
  };

  const handleEditWeight = (weight: WeightEntry) => {
    setEditingWeight(weight);
    setCurrentView('weight');
  };

  const handleUpdateWeight = async (weight: any) => {
    if (!editingWeight) return;
    
    try {
      await updateWeightEntry(editingWeight.id, weight);
      setEditingWeight(null);
      setCurrentView('lifestyle');
    } catch (error) {
      console.error('Failed to update weight entry:', error);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    try {
      await deleteWeightEntry(id);
    } catch (error) {
      console.error('Failed to delete weight entry:', error);
    }
  };

  const handleCancelWeightEdit = () => {
    setEditingWeight(null);
    setCurrentView('lifestyle');
  };

  if (loading || lifestyleLoading || weightLoading) {
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
          <div className="flex flex-col">
            {/* Navigation Groups */}
            <div className="flex space-x-4 py-2">
              <button 
                onClick={() => setActiveNavGroup('overview')}
                className={`flex items-center px-3 py-1 rounded-md ${activeNavGroup === 'overview' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}
              >
                <Layout className={`h-4 w-4 mr-2 ${activeNavGroup === 'overview' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Overview</span>
              </button>
              <button 
                onClick={() => setActiveNavGroup('data-entry')}
                className={`flex items-center px-3 py-1 rounded-md ${activeNavGroup === 'data-entry' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}
              >
                <PenSquare className={`h-4 w-4 mr-2 ${activeNavGroup === 'data-entry' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Data Entry</span>
              </button>
              <button 
                onClick={() => setActiveNavGroup('visualizations')}
                className={`flex items-center px-3 py-1 rounded-md ${activeNavGroup === 'visualizations' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}
              >
                <LineChart className={`h-4 w-4 mr-2 ${activeNavGroup === 'visualizations' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Visualizations</span>
              </button>
              <button 
                onClick={() => setActiveNavGroup('analysis')}
                className={`flex items-center px-3 py-1 rounded-md ${activeNavGroup === 'analysis' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}
              >
                <Brain className={`h-4 w-4 mr-2 ${activeNavGroup === 'analysis' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Analysis</span>
              </button>
            </div>
            
            {/* Navigation Items */}
            <div className="flex space-x-4 overflow-x-auto">
              {/* Overview Group */}
              {activeNavGroup === 'overview' && (
                <>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors ${currentView === 'dashboard' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentView('readings')}
                    className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors ${currentView === 'readings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <List className="h-4 w-4 mr-2" />
                    All Readings
                  </button>
                </>
              )}
              
              {/* Data Entry Group */}
              {activeNavGroup === 'data-entry' && (
                <>
                  <button
                    onClick={() => setCurrentView('add-entry')}
                    className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors ${currentView === 'add-entry' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </button>
                  <button
                    onClick={() => setCurrentView('lifestyle')}
                    className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors ${currentView === 'lifestyle' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <Cigarette className="h-4 w-4 mr-2" />
                    Lifestyle
                  </button>
                </>
              )}
              
              {/* Visualizations Group */}
              {activeNavGroup === 'visualizations' && (
                <>
                  <button
                    onClick={() => setCurrentView('chart')}
                    className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors ${currentView === 'chart' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Charts
                  </button>
                  <button
                    onClick={() => setCurrentView('calendar')}
                    className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors ${currentView === 'calendar' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Calendar
                  </button>
                  <button
                    onClick={() => setCurrentView('stats')}
                    className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors ${currentView === 'stats' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Statistics
                  </button>
                </>
              )}
              
              {/* Analysis Group */}
              {activeNavGroup === 'analysis' && (
                <>
                  <button
                    onClick={() => setCurrentView('ai-assistant')}
                    className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors ${currentView === 'ai-assistant' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    AI Assistant
                  </button>
                  <button
                    onClick={() => setCurrentView('print')}
                    className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors ${currentView === 'print' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard
            readings={readings}
            cigarEntries={cigarEntries}
            drinkEntries={drinkEntries}
            weightEntries={weightEntries}
            chartData={filteredChartData}
            onNavigate={(view) => setCurrentView(view as ViewMode)}
            onNavigateToGroup={(group, view) => {
              setActiveNavGroup(group);
              setCurrentView(view as ViewMode);
            }}
          />
        )}
        
        {currentView === 'add-entry' && (
          <UnifiedEntryForm
            onSubmitBP={editingReading ? handleUpdateReading : handleAddReading}
            onCancelBP={editingReading ? handleCancelEdit : undefined}
            initialBPData={editingReading}
            isEditingBP={!!editingReading}
            
            onSubmitCigar={editingCigar ? handleUpdateCigar : handleAddCigar}
            onCancelCigar={editingCigar ? handleCancelCigarEdit : undefined}
            initialCigarData={editingCigar}
            isEditingCigar={!!editingCigar}
            
            onSubmitDrink={editingDrink ? handleUpdateDrink : handleAddDrink}
            onCancelDrink={editingDrink ? handleCancelDrinkEdit : undefined}
            initialDrinkData={editingDrink}
            isEditingDrink={!!editingDrink}
            
            onSubmitWeight={editingWeight ? handleUpdateWeight : handleAddWeight}
            onCancelWeight={editingWeight ? handleCancelWeightEdit : undefined}
            initialWeightData={editingWeight}
            isEditingWeight={!!editingWeight}
          />
        )}
        
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

        {currentView === 'ai-assistant' && (
          <div className="max-w-6xl mx-auto">
            <EnhancedAIFeatures />
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
            {editingDrink ? (
              <DrinkForm
                key={editingDrink.id}
                onSubmit={handleUpdateDrink}
                onCancel={handleCancelDrinkEdit}
                initialData={editingDrink}
                isEditing={true}
              />
            ) : (
              <DrinkForm
                key="new"
                onSubmit={handleAddDrink}
                onCancel={undefined}
                initialData={undefined}
                isEditing={false}
              />
            )}
          </div>
        )}

        {currentView === 'weight' && (
          <div className="max-w-2xl mx-auto">
            {editingWeight ? (
              <WeightForm
                key={editingWeight.id}
                onSubmit={handleUpdateWeight}
                onCancel={handleCancelWeightEdit}
                initialData={editingWeight}
                isEditing={true}
              />
            ) : (
              <WeightForm
                key="new"
                onSubmit={handleAddWeight}
                onCancel={undefined}
                initialData={undefined}
                isEditing={false}
              />
            )}
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
              <button
                onClick={() => setCurrentView('weight')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Scale className="h-4 w-4 mr-2" />
                Add Weight Entry
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
            <WeightEntriesList
              weightEntries={weightEntries}
              onEdit={handleEditWeight}
              onDelete={handleDeleteWeight}
            />
          </div>
        )}

        {currentView === 'print' && (
          <div className="max-w-7xl mx-auto">
            <PrintReport
              readings={readings}
            />
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="max-w-7xl mx-auto">
            <LifestyleCalendar
              cigarEntries={cigarEntries}
              drinkEntries={drinkEntries}
              weightEntries={weightEntries}
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
